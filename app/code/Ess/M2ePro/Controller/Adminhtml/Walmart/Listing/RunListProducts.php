<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Walmart\Listing;

class RunListProducts extends \Ess\M2ePro\Controller\Adminhtml\Walmart\Listing\ActionAbstract
{
    public function execute()
    {
        return $this->scheduleAction(
            \Ess\M2ePro\Model\Listing\Product::ACTION_LIST
        );
    }
}
