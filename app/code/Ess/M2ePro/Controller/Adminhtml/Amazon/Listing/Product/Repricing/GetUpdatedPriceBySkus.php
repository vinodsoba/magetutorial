<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Amazon\Listing\Product\Repricing;

use Ess\M2ePro\Controller\Adminhtml\Context;

/**
 * Class \Ess\M2ePro\Controller\Adminhtml\Amazon\Listing\Product\Repricing\GetUpdatedPriceBySkus
 */
class GetUpdatedPriceBySkus extends \Ess\M2ePro\Controller\Adminhtml\Amazon\Main
{
    protected $localeCurrency;

    /** @var \Ess\M2ePro\Helper\Data */
    private $helperData;

    public function __construct(
        \Ess\M2ePro\Helper\Data $helperData,
        \Magento\Framework\Locale\CurrencyInterface $localeCurrency,
        \Ess\M2ePro\Model\ActiveRecord\Component\Parent\Amazon\Factory $amazonFactory,
        Context $context
    ) {
        $this->helperData = $helperData;
        $this->localeCurrency = $localeCurrency;
        parent::__construct($amazonFactory, $context);
    }

    public function execute()
    {
        $groupedSkus = $this->getRequest()->getParam('grouped_skus');

        if (empty($groupedSkus)) {
            return $this->getResponse()->setBody('You should provide correct parameters.');
        }

        $groupedSkus = $this->helperData->jsonDecode($groupedSkus);
        $resultPrices = [];

        foreach ($groupedSkus as $accountId => $skus) {
            /** @var \Ess\M2ePro\Model\Account $account */
            $account = $this->amazonFactory->getCachedObjectLoaded('Account', $accountId);

            /** @var \Ess\M2ePro\Model\Amazon\Account $amazonAccount */
            $amazonAccount = $account->getChildObject();

            $currency = $amazonAccount->getMarketplace()->getChildObject()->getDefaultCurrency();

            /** @var \Ess\M2ePro\Model\Amazon\Repricing\Synchronization\ActualPrice $repricingSynchronization */
            $repricingSynchronization = $this->modelFactory->getObject('Amazon_Repricing_Synchronization_ActualPrice');
            $repricingSynchronization->setAccount($account);
            $repricingSynchronization->run($skus);

            /** @var \Ess\M2ePro\Model\ResourceModel\Listing\Product\Collection $listingProductCollection */
            $listingProductCollection = $this->amazonFactory->getObject('Listing\Product')->getCollection();
            $listingProductCollection->getSelect()->joinLeft(
                ['l' => $this->activeRecordFactory->getObject('Listing')->getResource()->getMainTable()],
                'l.id = main_table.listing_id',
                []
            );
            $listingProductCollection->addFieldToFilter('l.account_id', $accountId);
            $listingProductCollection->addFieldToFilter('sku', ['in' => $skus]);

            $listingProductCollection->getSelect()->reset(\Magento\Framework\DB\Select::COLUMNS);
            $listingProductCollection->getSelect()->columns(
                [
                    'second_table.sku',
                    'second_table.online_regular_price'
                ]
            );

            $listingsProductsData = $listingProductCollection->getData();

            foreach ($listingsProductsData as $listingProductData) {
                $price = $this->localeCurrency
                    ->getCurrency($currency)
                    ->toCurrency($listingProductData['online_regular_price']);
                $resultPrices[$accountId][$listingProductData['sku']] = $price;
            }

            /** @var \Ess\M2ePro\Model\ResourceModel\Listing\Other\Collection $listingOtherCollection */
            $listingOtherCollection = $this->amazonFactory->getObject('Listing\Other')->getCollection();

            $listingOtherCollection->addFieldToFilter('account_id', $accountId);
            $listingOtherCollection->addFieldToFilter('sku', ['in' => $skus]);

            $listingOtherCollection->getSelect()->reset(\Magento\Framework\DB\Select::COLUMNS);
            $listingOtherCollection->getSelect()->columns(
                [
                    'second_table.sku',
                    'second_table.online_price'
                ]
            );

            $listingsOthersData = $listingOtherCollection->getData();

            foreach ($listingsOthersData as $listingOtherData) {
                $price = $this->localeCurrency->getCurrency($currency)->toCurrency($listingOtherData['online_price']);
                $resultPrices[$accountId][$listingOtherData['sku']] = $price;
            }
        }

        $this->setJsonContent($resultPrices);

        return $this->getResult();
    }
}
