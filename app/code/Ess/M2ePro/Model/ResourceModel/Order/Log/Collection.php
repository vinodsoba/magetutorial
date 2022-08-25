<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Model\ResourceModel\Order\Log;

/**
 * Class \Ess\M2ePro\Model\ResourceModel\Order\Log\Collection
 */
class Collection extends \Ess\M2ePro\Model\ResourceModel\ActiveRecord\Collection\AbstractModel
{
    //########################################

    public function _construct()
    {
        parent::_construct();
        $this->_init(
            \Ess\M2ePro\Model\Order\Log::class,
            \Ess\M2ePro\Model\ResourceModel\Order\Log::class
        );
    }

    //########################################

    /**
     * GroupBy fix
     */
    public function getSelectCountSql()
    {
        $sql = parent::getSelectCountSql();
        $sql->reset(\Magento\Framework\DB\Select::GROUP);
        return $sql;
    }

    //########################################
}
