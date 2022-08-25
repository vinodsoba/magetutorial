<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Model\Amazon\Repricing\Synchronization;

/**
 * Class \Ess\M2ePro\Model\Amazon\Repricing\Synchronization\General
 */
class General extends AbstractModel
{
    const INSTRUCTION_TYPE_STATUS_CHANGED = 'repricing_status_changed';
    const INSTRUCTION_INITIATOR           = 'repricing_general_synchronization';

    private $parentProductsIds = [];

    //########################################

    public function run($skus = null)
    {
        if ($skus !== null && empty($skus)) {
            return false;
        }

        $filters = [];
        if ($skus !== null) {
            $filters = [
                'skus_list' => $skus,
            ];
            $skus = array_map('strtolower', $skus);
        }

        $response = $this->sendRequest($filters);

        if ($response === false || empty($response['status'])) {
            return false;
        }

        if (!empty($response['email'])) {
            $this->getAmazonAccountRepricing()->setData('email', $response['email']);
        }

        if ($skus === null) {
            $this->getAmazonAccountRepricing()->setData('total_products', count($response['offers']));
            $this->getAmazonAccountRepricing()->save();
        }

        /** @var \Ess\M2ePro\Model\ResourceModel\Amazon\Listing\Product\Repricing $productResource */
        /** @var \Ess\M2ePro\Model\ResourceModel\Amazon\Listing\Other $otherResource */
        $productResource = $this->activeRecordFactory->getObject('Amazon_Listing_Product_Repricing')->getResource();
        $otherResource = $this->activeRecordFactory->getObject('Amazon_Listing_Other')->getResource();

        $existedSkus = array_unique(array_merge(
            $productResource->getSkus($this->getAccount(), $skus),
            $otherResource->getRepricingSkus($this->getAccount(), $skus)
        ));
        $existedSkus = array_map('strtolower', $existedSkus);

        $skuIndexedResultOffersData = [];
        foreach ($response['offers'] as $offerData) {
            $offerSku = strtolower($offerData['sku']);
            if ($skus !== null && !in_array($offerSku, $skus, true)) {
                continue;
            }

            $skuIndexedResultOffersData[$offerSku] = $offerData;
        }

        $this->processNewOffers($skuIndexedResultOffersData, $existedSkus);
        $this->processRemovedOffers($skuIndexedResultOffersData, $existedSkus);
        $this->processUpdatedOffers($skuIndexedResultOffersData, $existedSkus);

        $this->processVariationProcessor();

        return true;
    }

    public function reset(array $skus = [])
    {
        $this->removeListingsProductsRepricing($skus);
        $this->removeListingsOthersRepricing($skus);

        $this->processVariationProcessor();
    }

    //########################################

    protected function getMode()
    {
        return self::MODE_GENERAL;
    }

    //########################################

    private function processNewOffers(array $resultOffersData, array $existedSkus)
    {
        $newOffersData = [];
        foreach ($resultOffersData as $offerSku => $offerData) {
            if (!in_array((string)$offerSku, $existedSkus, true)) {
                $newOffersData[(string)$offerSku] = $offerData;
            }
        }

        if (empty($newOffersData)) {
            return;
        }

        $this->addListingsProductsRepricing($newOffersData);
        $this->addListingOthersRepricing($newOffersData);
    }

    private function processRemovedOffers(array $resultOffersData, array $existedSkus)
    {
        $removedOffersSkus = [];
        foreach ($existedSkus as $existedSku) {
            if (!array_key_exists((string)$existedSku, $resultOffersData)) {
                $removedOffersSkus[] = (string)$existedSku;
            }
        }

        if (empty($removedOffersSkus)) {
            return;
        }

        $this->removeListingsProductsRepricing($removedOffersSkus);
        $this->removeListingsOthersRepricing($removedOffersSkus);
    }

    private function processUpdatedOffers(array $resultOffersData, array $existedSkus)
    {
        $updatedOffersData = [];
        foreach ($resultOffersData as $offerSku => $offerData) {
            if (in_array((string)$offerSku, $existedSkus, true)) {
                $updatedOffersData[(string)$offerSku] = $offerData;
            }
        }

        if (empty($updatedOffersData)) {
            return;
        }

        $this->updateListingsProductsRepricing($updatedOffersData);
        $this->updateListingsOthersRepricing($updatedOffersData);
    }

    //########################################

    private function addListingsProductsRepricing(array $newOffersData)
    {
        /** @var \Ess\M2ePro\Model\ResourceModel\Amazon\Listing\Product $resourceModel */
        $resourceModel = $this->activeRecordFactory->getObject('Amazon_Listing_Product')->getResource();
        $listingsProductsData = $resourceModel->getProductsDataBySkus(
            array_keys($newOffersData),
            [
                'l.account_id' => $this->getAccount()->getId(),
            ],
            [
                'second_table.variation_parent_id',
                'second_table.listing_product_id',
                'second_table.sku',
                'second_table.online_regular_price',
            ]
        );

        if (empty($listingsProductsData)) {
            return;
        }

        $insertData = [];

        foreach ($listingsProductsData as $listingProductData) {
            $listingProductId       = (int)$listingProductData['listing_product_id'];
            $parentListingProductId = (int)$listingProductData['variation_parent_id'];

            $offerData = $newOffersData[strtolower($listingProductData['sku'])];

            $insertData[$listingProductId] = [
                'listing_product_id'        => $listingProductId,
                'online_regular_price'      => $offerData['regular_product_price'],
                'online_min_price'          => $offerData['minimal_product_price'],
                'online_max_price'          => $offerData['maximal_product_price'],
                'is_online_disabled'        => $offerData['is_calculation_disabled'],
                'is_online_inactive'        => $offerData['is_offer_inactive'],
                'last_synchronization_date' => $this->getHelper('Data')->getCurrentGmtDate(),
                'update_date'               => $this->getHelper('Data')->getCurrentGmtDate(),
                'create_date'               => $this->getHelper('Data')->getCurrentGmtDate(),
            ];

            if ($offerData['product_price'] !== null &&
                $offerData['product_price'] != $listingProductData['online_regular_price']
            ) {
                $this->resourceConnection->getConnection()->update(
                    $this->getHelper('Module_Database_Structure')
                         ->getTableNameWithPrefix('m2epro_amazon_listing_product'),
                    ['online_regular_price' => $offerData['product_price']],
                    ['listing_product_id = ?' => $listingProductId]
                );
            }

            if ($parentListingProductId && !in_array($parentListingProductId, $this->parentProductsIds)) {
                $this->parentProductsIds[] = $parentListingProductId;
            }
        }

        foreach (array_chunk($insertData, 1000, true) as $insertDataPack) {
            $this->resourceConnection->getConnection()->insertOnDuplicate(
                $this->getHelper('Module_Database_Structure')
                     ->getTableNameWithPrefix('m2epro_amazon_listing_product_repricing'),
                $insertDataPack
            );

            $this->resourceConnection->getConnection()->update(
                $this->getHelper('Module_Database_Structure')->getTableNameWithPrefix('m2epro_amazon_listing_product'),
                [
                    'is_repricing'                         => 1,
                    'online_regular_sale_price'            => 0,
                    'online_regular_sale_price_start_date' => null,
                    'online_regular_sale_price_end_date'   => null,
                ],
                ['listing_product_id IN (?)' => array_keys($insertDataPack)]
            );
        }
    }

    private function addListingOthersRepricing(array $newOffersData)
    {
        /** @var \Ess\M2ePro\Model\ResourceModel\Amazon\Listing\Other $resourceModel */
        $resourceModel = $this->activeRecordFactory->getObject('Amazon_Listing_Other')->getResource();
        $listingsOthersData = $resourceModel->getProductsDataBySkus(
            array_keys($newOffersData),
            [
                'account_id' => $this->getAccount()->getId(),
            ],
            [
                'second_table.listing_other_id',
                'second_table.sku',
                'second_table.online_price'
            ]
        );

        if (empty($listingsOthersData)) {
            return;
        }

        $disabledListingOthersIds  = [];
        $enabledListingOthersIds   = [];
        $activeListingOthersIds    = [];
        $inactiveListingOthersIds  = [];

        foreach ($listingsOthersData as $listingOtherData) {
            $listingOtherId = (int)$listingOtherData['listing_other_id'];
            $offerData = $newOffersData[strtolower($listingOtherData['sku'])];

            if ($offerData['product_price'] !== null &&
                $offerData['product_price'] != $listingOtherData['online_price']
            ) {
                $this->resourceConnection->getConnection()->update(
                    $this->getHelper('Module_Database_Structure')
                         ->getTableNameWithPrefix('m2epro_amazon_listing_other'),
                    [
                        'online_price'          => $offerData['product_price'],
                        'is_repricing'          => 1,
                        'is_repricing_disabled' => $offerData['is_calculation_disabled'],
                        'is_repricing_inactive' => $offerData['is_offer_inactive'],
                    ],
                    ['listing_other_id = ?' => $listingOtherId]
                );

                continue;
            }

            if ($offerData['is_calculation_disabled']) {
                $disabledListingOthersIds[] = $listingOtherId;
            } else {
                $enabledListingOthersIds[] = $listingOtherId;
            }

            if ($offerData['is_offer_inactive']) {
                $inactiveListingOthersIds[] = $listingOtherId;
            } else {
                $activeListingOthersIds[] = $listingOtherId;
            }
        }

        if (!empty($enabledListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_disabled' => 0],
                $enabledListingOthersIds
            );
        }

        if (!empty($disabledListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_disabled' => 1],
                $disabledListingOthersIds
            );
        }

        if (!empty($activeListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_inactive' => 0],
                $activeListingOthersIds
            );
        }

        if (!empty($inactiveListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_inactive' => 1],
                $inactiveListingOthersIds
            );
        }
    }

    //----------------------------------------

    private function updateListingsProductsRepricing(array $updatedOffersData)
    {
        $keys = array_map(function ($el) {
            return (string)$el;
        }, array_keys($updatedOffersData));

        $listingProductCollection = $this->amazonFactory->getObject('Listing\Product')->getCollection();
        $listingProductCollection->addFieldToFilter('is_variation_parent', 0);
        $listingProductCollection->addFieldToFilter('is_repricing', 1);

        $listingProductCollection->getSelect()->joinLeft(
            ['l' => $this->activeRecordFactory->getObject('Listing')->getResource()->getMainTable()],
            'l.id = main_table.listing_id',
            []
        );
        $listingProductCollection->getSelect()->joinInner(
            [
                'alpr' => $this->activeRecordFactory->getObject('Amazon_Listing_Product_Repricing')
                    ->getResource()->getMainTable()
            ],
            'alpr.listing_product_id=main_table.id',
            []
        );
        $listingProductCollection->addFieldToFilter('l.account_id', $this->getAccount()->getId());
        $listingProductCollection->addFieldToFilter('sku', ['in' => $keys]);

        $listingProductCollection->getSelect()->reset(\Magento\Framework\DB\Select::COLUMNS);
        $listingProductCollection->getSelect()->columns(
            [
                'main_table.product_id',
                'second_table.listing_product_id',
                'second_table.sku',
                'second_table.online_regular_price',
                'alpr.is_online_disabled',
                'alpr.is_online_inactive',
                'alpr.online_regular_price',
                'alpr.online_min_price',
                'alpr.online_max_price'
            ]
        );

        $listingsProductsData = $listingProductCollection->getData();

        $notManagedListingsProductsIds = [];

        $enabledListingsProductsIds    = [];
        $disabledListingsProductsIds   = [];

        $activeListingsProductsIds     = [];
        $inactiveListingsProductsIds   = [];

        foreach ($listingsProductsData as $listingProductData) {
            $listingProductId = (int)$listingProductData['listing_product_id'];

            $offerData = $updatedOffersData[strtolower($listingProductData['sku'])];

            if ($offerData['product_price'] !== null &&
                !$offerData['is_calculation_disabled'] && !$offerData['is_offer_inactive'] &&
                 $listingProductData['online_regular_price'] != $offerData['product_price']
            ) {
                $this->resourceConnection->getConnection()->update(
                    $this->getHelper('Module_Database_Structure')
                         ->getTableNameWithPrefix('m2epro_amazon_listing_product'),
                    ['online_regular_price' => $offerData['product_price']],
                    ['listing_product_id = ?' => $listingProductId]
                );
            }

            if ($listingProductData['online_regular_price'] != $offerData['regular_product_price'] ||
                $listingProductData['online_min_price'] != $offerData['minimal_product_price'] ||
                $listingProductData['online_max_price'] != $offerData['maximal_product_price']
            ) {
                $this->resourceConnection->getConnection()->update(
                    $this->getHelper('Module_Database_Structure')
                         ->getTableNameWithPrefix('m2epro_amazon_listing_product_repricing'),
                    [
                        'online_regular_price'      => $offerData['regular_product_price'],
                        'online_min_price'          => $offerData['minimal_product_price'],
                        'online_max_price'          => $offerData['maximal_product_price'],
                        'is_online_disabled'        => $offerData['is_calculation_disabled'],
                        'is_online_inactive'        => $offerData['is_offer_inactive'],
                        'last_synchronization_date' => $this->getHelper('Data')->getCurrentGmtDate(),
                        'update_date'               => $this->getHelper('Data')->getCurrentGmtDate(),
                    ],
                    ['listing_product_id = ?' => $listingProductId]
                );

                continue;
            }

            if ($listingProductData['is_online_disabled'] != $offerData['is_calculation_disabled']) {
                if ($offerData['is_calculation_disabled']) {
                    $disabledListingsProductsIds[] = $listingProductId;
                } else {
                    $enabledListingsProductsIds[] = $listingProductId;
                }
            }

            if ($listingProductData['is_online_inactive'] != $offerData['is_offer_inactive']) {
                if ($offerData['is_offer_inactive']) {
                    $inactiveListingsProductsIds[] = $listingProductId;
                } else {
                    $activeListingsProductsIds[] = $listingProductId;
                }
            }

            // we try to catch an event when the product becomes not managed for some reason
            // but it had the managed state before
            if ($listingProductData['is_online_disabled'] != $offerData['is_calculation_disabled'] ||
                $listingProductData['is_online_inactive'] != $offerData['is_offer_inactive']) {
                if (!$listingProductData['is_online_disabled'] && !$listingProductData['is_online_inactive']) {
                    $notManagedListingsProductsIds[] = $listingProductId;
                }
            }
        }

        if (!empty($notManagedListingsProductsIds)) {
            $instructionsData = [];

            foreach ($notManagedListingsProductsIds as $notManagedListingProductId) {
                $instructionsData[] = [
                    'listing_product_id' => $notManagedListingProductId,
                    'type'               => self::INSTRUCTION_TYPE_STATUS_CHANGED,
                    'initiator'          => self::INSTRUCTION_INITIATOR,
                    'priority'           => 50,
                ];
            }

            $this->activeRecordFactory->getObject('Listing_Product_Instruction')->getResource()
                ->add($instructionsData);
        }

        $defaultParams = [
            'last_synchronization_date' => $this->getHelper('Data')->getCurrentGmtDate(),
            'update_date'               => $this->getHelper('Data')->getCurrentGmtDate()
        ];

        if (!empty($enabledListingsProductsIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_product_repricing',
                array_merge(
                    $defaultParams,
                    ['is_online_disabled' => 0]
                ),
                $enabledListingsProductsIds
            );
        }

        if (!empty($disabledListingsProductsIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_product_repricing',
                array_merge(
                    $defaultParams,
                    ['is_online_disabled' => 1]
                ),
                $disabledListingsProductsIds
            );
        }

        if (!empty($activeListingsProductsIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_product_repricing',
                array_merge(
                    $defaultParams,
                    ['is_online_inactive' => 0]
                ),
                $activeListingsProductsIds
            );
        }

        if (!empty($inactiveListingsProductsIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_product_repricing',
                array_merge(
                    $defaultParams,
                    ['is_online_inactive' => 1]
                ),
                $inactiveListingsProductsIds
            );
        }
    }

    private function updateListingsOthersRepricing(array $updatedOffersData)
    {
        $keys = array_map(function ($el) {
            return (string)$el;
        }, array_keys($updatedOffersData));

        $listingOtherCollection = $this->amazonFactory->getObject('Listing\Other')->getCollection();
        $listingOtherCollection->addFieldToFilter('account_id', $this->getAccount()->getId());
        $listingOtherCollection->addFieldToFilter('sku', ['in' => $keys]);
        $listingOtherCollection->addFieldToFilter('is_repricing', 1);

        $listingOtherCollection->getSelect()->reset(\Magento\Framework\DB\Select::COLUMNS);
        $listingOtherCollection->getSelect()->columns(
            [
                'second_table.listing_other_id',
                'second_table.sku',
                'second_table.online_price',
                'second_table.is_repricing_disabled',
                'second_table.is_repricing_inactive',
            ]
        );

        $listingsOthersData = $listingOtherCollection->getData();

        if (empty($listingsOthersData)) {
            return;
        }

        $enabledListingOthersIds  = [];
        $disabledListingOthersIds = [];
        $activeListingOthersIds   = [];
        $inactiveListingOthersIds = [];

        foreach ($listingsOthersData as $listingOtherData) {
            $listingOtherId = (int)$listingOtherData['listing_other_id'];

            $offerData = $updatedOffersData[strtolower($listingOtherData['sku'])];

            if ($offerData['product_price'] !== null &&
                !$offerData['is_calculation_disabled'] && !$offerData['is_offer_inactive'] &&
                $offerData['product_price'] != $listingOtherData['online_price']
            ) {
                $this->resourceConnection->getConnection()->update(
                    $this->getHelper('Module_Database_Structure')
                         ->getTableNameWithPrefix('m2epro_amazon_listing_other'),
                    [
                        'online_price'          => $offerData['product_price'],
                        'is_repricing_disabled' => $offerData['is_calculation_disabled'],
                        'is_repricing_inactive' => $offerData['is_offer_inactive'],
                    ],
                    ['listing_other_id = ?' => $listingOtherId]
                );

                continue;
            }

            if ($listingOtherData['is_repricing_disabled'] != $offerData['is_calculation_disabled']) {
                if ($offerData['is_calculation_disabled']) {
                    $disabledListingOthersIds[] = $listingOtherId;
                } else {
                    $enabledListingOthersIds[] = $listingOtherId;
                }
            }

            if ($listingOtherData['is_repricing_inactive'] != !$offerData['is_offer_inactive']) {
                if ($offerData['is_offer_inactive']) {
                    $inactiveListingOthersIds[] = $listingOtherId;
                } else {
                    $activeListingOthersIds[] = $listingOtherId;
                }
            }
        }

        if (!empty($enabledListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_disabled' => 0],
                $enabledListingOthersIds
            );
        }

        if (!empty($disabledListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_disabled' => 1],
                $disabledListingOthersIds
            );
        }

        if (!empty($activeListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_inactive' => 0],
                $activeListingOthersIds
            );
        }

        if (!empty($inactiveListingOthersIds)) {
            $this->multipleUpdateListings(
                'm2epro_amazon_listing_other',
                ['is_repricing' => 1, 'is_repricing_inactive' => 1],
                $inactiveListingOthersIds
            );
        }
    }

    //----------------------------------------

    private function removeListingsProductsRepricing(array $removedOffersSkus)
    {
        /** @var \Ess\M2ePro\Model\ResourceModel\Amazon\Listing\Product $resourceModel */
        $resourceModel = $this->activeRecordFactory->getObject('Amazon_Listing_Product')->getResource();
        $listingsProductsData = $resourceModel->getProductsDataBySkus(
            $removedOffersSkus,
            [
                'l.account_id' => $this->getAccount()->getId(),
            ],
            [
                'main_table.id',
                'second_table.variation_parent_id',
            ]
        );

        if (empty($listingsProductsData)) {
            return;
        }

        $listingProductIds = [];

        foreach ($listingsProductsData as $listingProductData) {
            $listingProductIds[] = (int)$listingProductData['id'];
            $parentListingProductId = (int)$listingProductData['variation_parent_id'];

            if ($parentListingProductId && !in_array($parentListingProductId, $this->parentProductsIds)) {
                $this->parentProductsIds[] = $parentListingProductId;
            }
        }

        foreach (array_chunk($listingProductIds, 1000, true) as $listingProductIdsPack) {
            $this->resourceConnection->getConnection()->delete(
                $this->getHelper('Module_Database_Structure')
                     ->getTableNameWithPrefix('m2epro_amazon_listing_product_repricing'),
                ['listing_product_id IN (?)' => $listingProductIdsPack]
            );

            $this->resourceConnection->getConnection()->update(
                $this->getHelper('Module_Database_Structure')->getTableNameWithPrefix('m2epro_amazon_listing_product'),
                ['is_repricing' => 0],
                ['listing_product_id IN (?)' => $listingProductIdsPack]
            );
        }
    }

    private function removeListingsOthersRepricing(array $removedOffersSkus)
    {
        /** @var \Ess\M2ePro\Model\ResourceModel\Amazon\Listing\Other $resourceModel */
        $resourceModel = $this->activeRecordFactory->getObject('Amazon_Listing_Other')->getResource();
        $listingsOthersData = $resourceModel->getProductsDataBySkus(
            $removedOffersSkus,
            [
                'account_id' => $this->getAccount()->getId()
            ],
            [
                'main_table.id'
            ]
        );

        if (empty($listingsOthersData)) {
            return;
        }

        $listingOtherIds = [];
        foreach ($listingsOthersData as $listingsOtherData) {
            $listingOtherIds[] = (int)$listingsOtherData['id'];
        }

        foreach (array_chunk($listingOtherIds, 1000, true) as $listingOtherIdsPack) {
            $this->resourceConnection->getConnection()->update(
                $this->getHelper('Module_Database_Structure')->getTableNameWithPrefix('m2epro_amazon_listing_other'),
                [
                    'is_repricing'          => 0,
                    'is_repricing_disabled' => 0,
                    'is_repricing_inactive' => 0
                ],
                ['listing_other_id IN (?)' => $listingOtherIdsPack]
            );
        }
    }

    //########################################

    private function processVariationProcessor()
    {
        if (empty($this->parentProductsIds)) {
            return;
        }

        $listingProductCollection = $this->amazonFactory->getObject('Listing\Product')->getCollection();
        $listingProductCollection->addFieldToFilter('is_variation_parent', 1);
        $listingProductCollection->addFieldToFilter('id', ['in' => $this->parentProductsIds]);

        foreach ($listingProductCollection->getItems() as $item) {
            /** @var \Ess\M2ePro\Model\Listing\Product $item */
            /** @var \Ess\M2ePro\Model\Amazon\Listing\Product $alp */

            $alp = $item->getChildObject();
            $alp->getVariationManager()->getTypeModel()->getProcessor()->process();
        }

        $this->parentProductsIds = [];
    }

    //########################################

    protected function multipleUpdateListings($tableName, $params, $listingsIds)
    {
        if ($tableName === 'm2epro_amazon_listing_product_repricing') {
            $tableId = 'listing_product_id';
        } else {
            $tableId = 'listing_other_id';
        }

        $tableName = $this->getHelper('Module_Database_Structure')->getTableNameWithPrefix($tableName);

        $listingsIdsPacks = array_chunk(array_unique($listingsIds), 1000);

        foreach ($listingsIdsPacks as $listingsIdsPack) {
            $this->resourceConnection->getConnection()->update(
                $tableName,
                $params,
                [$tableId . ' IN (?)' => $listingsIdsPack]
            );
        }
    }

    //########################################
}
