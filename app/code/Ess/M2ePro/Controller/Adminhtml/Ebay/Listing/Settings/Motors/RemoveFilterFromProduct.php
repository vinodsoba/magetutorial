<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Ebay\Listing\Settings\Motors;

class RemoveFilterFromProduct extends \Ess\M2ePro\Controller\Adminhtml\Ebay\Listing
{
    /** @var \Ess\M2ePro\Helper\Component\Ebay\Motors */
    private $componentEbayMotors;

    public function __construct(
        \Ess\M2ePro\Helper\Component\Ebay\Motors $componentEbayMotors,
        \Ess\M2ePro\Model\ActiveRecord\Component\Parent\Ebay\Factory $ebayFactory,
        \Ess\M2ePro\Controller\Adminhtml\Context $context
    ) {
        parent::__construct($ebayFactory, $context);

        $this->componentEbayMotors = $componentEbayMotors;
    }

    public function execute()
    {
        $filtersIds = $this->getRequest()->getParam('filters_ids');
        $entityId = $this->getRequest()->getParam('entity_id');
        $motorsType = $this->getRequest()->getParam('motors_type');

        if (!is_array($filtersIds)) {
            $filtersIds = explode(',', $filtersIds);
        }

        $listingProduct = $this->ebayFactory->getObjectLoaded('Listing\Product', $entityId);

        $motorsAttribute = $this->componentEbayMotors->getAttribute($motorsType);
        $attributeValue = $listingProduct->getMagentoProduct()->getAttributeValue($motorsAttribute);

        $motorsData = $this->componentEbayMotors->parseAttributeValue($attributeValue);

        foreach ($filtersIds as $filterId) {
            if (($key = array_search($filterId, $motorsData['filters'])) !== false) {
                unset($motorsData['filters'][$key]);
            }
        }

        $attributeValue = $this->componentEbayMotors->buildAttributeValue($motorsData);

        $this->activeRecordFactory->getObject('Ebay\Listing')->getResource()->updateMotorsAttributesData(
            $listingProduct->getListingId(),
            [$entityId],
            $motorsAttribute,
            $attributeValue,
            true
        );

        $this->setAjaxContent(0, false);

        return $this->getResult();
    }

    //########################################
}
