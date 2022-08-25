<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Model\ResourceModel\Ebay\Motor\Filter\To;

/**
 * Class \Ess\M2ePro\Model\ResourceModel\Ebay\Motor\Filter\To\Group
 */
class Group extends \Ess\M2ePro\Model\ResourceModel\ActiveRecord\AbstractModel
{
    //########################################

    protected function _construct()
    {
        $this->_init('m2epro_ebay_motor_filter_to_group', 'id');
    }

    //########################################
}
