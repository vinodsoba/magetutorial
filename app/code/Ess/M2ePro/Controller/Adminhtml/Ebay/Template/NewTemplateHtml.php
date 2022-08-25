<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Ebay\Template;

use Ess\M2ePro\Controller\Adminhtml\Ebay\Template;

class NewTemplateHtml extends Template
{
    public function execute()
    {
        $nick = $this->getRequest()->getParam('nick');

        $this->setAjaxContent(
            $this->getLayout()->createBlock(\Ess\M2ePro\Block\Adminhtml\Ebay\Listing\Template\NewTemplate\Form::class)
                              ->setData('nick', $nick)
        );

        return $this->getResult();
    }
}
