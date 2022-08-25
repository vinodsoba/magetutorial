<?php

/**
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Any usage is forbidden
 */

namespace Ess\M2ePro\Model\Ebay\Listing\Product\Indexer;

/**
 * Class \Ess\M2ePro\Model\Ebay\Listing\Product\Indexer\VariationParent
 */
class VariationParent extends \Ess\M2ePro\Model\ActiveRecord\Component\AbstractModel
{
    //########################################

    public function _construct()
    {
        parent::_construct();
        $this->_init(\Ess\M2ePro\Model\ResourceModel\Ebay\Listing\Product\Indexer\VariationParent::class);
    }

    //########################################
}
