<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Ebay\Template;

use Ess\M2ePro\Controller\Adminhtml\Ebay\Template;

class Index extends Template
{
    public function execute()
    {
        $content = $this->getLayout()->createBlock(\Ess\M2ePro\Block\Adminhtml\Ebay\Template::class);

        $this->getResult()->getConfig()->getTitle()->prepend('Policies');
        $this->addContent($content);
        $this->setPageHelpLink('x/_v4UB');

        return $this->getResult();
    }
}
