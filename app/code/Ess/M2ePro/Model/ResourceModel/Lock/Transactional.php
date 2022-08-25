<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Model\ResourceModel\Lock;

/**
 * Class \Ess\M2ePro\Model\ResourceModel\Lock\Transactional
 */
class Transactional extends \Ess\M2ePro\Model\ResourceModel\ActiveRecord\AbstractModel
{
    //########################################

    public function _construct()
    {
        $this->_init('m2epro_lock_transactional', 'id');
    }

    //########################################
}
