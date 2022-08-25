<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Ebay\Template;

use Ess\M2ePro\Controller\Adminhtml\Ebay\Template;
use Ess\M2ePro\Helper\Data;
use Magento\Backend\App\Action;

class Edit extends Template
{
    /** @var \Ess\M2ePro\Helper\Data */
    private $dataHelper;

    /** @var \Ess\M2ePro\Helper\Component\Ebay\Template\Switcher\DataLoader */
    private $componentEbayTemplateSwitcherDataLoader;

    public function __construct(
        \Ess\M2ePro\Helper\Data $dataHelper,
        \Ess\M2ePro\Helper\Component\Ebay\Template\Switcher\DataLoader $componentEbayTemplateSwitcherDataLoader,
        \Ess\M2ePro\Model\Ebay\Template\Manager $templateManager,
        \Ess\M2ePro\Model\ActiveRecord\Component\Parent\Ebay\Factory $ebayFactory,
        \Ess\M2ePro\Controller\Adminhtml\Context $context
    ) {
        parent::__construct($templateManager, $ebayFactory, $context);

        $this->dataHelper = $dataHelper;
        $this->componentEbayTemplateSwitcherDataLoader = $componentEbayTemplateSwitcherDataLoader;
    }

    public function execute()
    {
        // ---------------------------------------
        $id = $this->getRequest()->getParam('id');
        $nick = $this->getRequest()->getParam('nick');
        // ---------------------------------------

        // ---------------------------------------
        $manager = $this->templateManager->setTemplate($nick);
        $template = $manager->getTemplateModel()
            ->getCollection()
            ->addFieldToFilter('id', $id)
            ->addFieldToFilter('is_custom_template', 0)
            ->getFirstItem();
        // ---------------------------------------

        // ---------------------------------------
        if (!$template->getId() && $id) {
            $this->getMessageManager()->addError($this->__('Policy does not exist.'));
            return $this->_redirect('*/*/index');
        }
        // ---------------------------------------

        // ---------------------------------------
        /** @var \Ess\M2ePro\Helper\Component\Ebay\Template\Switcher\DataLoader $dataLoader */
        $dataLoader = $this->componentEbayTemplateSwitcherDataLoader;
        $dataLoader->load($template);
        // ---------------------------------------

        $content = $this->getLayout()->createBlock(
            \Ess\M2ePro\Block\Adminhtml\Ebay\Template\Edit::class,
            '',
            ['data' => [
                'template_nick' => $nick
            ]]
        );

        switch ($nick) {
            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_RETURN_POLICY:
                $this->setPageHelpLink('x/dgAVB');
                break;

            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_SHIPPING:
                $this->setPageHelpLink('x/YgAVB');
                break;

            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_DESCRIPTION:
                $this->setPageHelpLink('x/ff8UB');
                break;

            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_SELLING_FORMAT:
                $this->setPageHelpLink('x/e-8UB');
                break;

            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_SYNCHRONIZATION:
                $this->setPageHelpLink('x/Y-8UB');
                break;
        }

        if ($template->getId()) {
            $headerText =
                $this->__(
                    'Edit "%template_title%" %template_name% Policy',
                    $this->dataHelper->escapeHtml($template->getTitle()),
                    $this->getTemplateName($nick)
                );
        } else {
            $headerText = $this->__(
                'Add %template_name% Policy',
                $this->getTemplateName($nick)
            );
        }

        $this->getResult()->getConfig()->getTitle()->prepend($headerText);
        $this->addContent($content);
        return $this->getResult();
    }

    protected function getTemplateName($nick)
    {
        $title = '';

        switch ($nick) {
            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_SHIPPING:
                $title = $this->__('Shipping');
                break;
            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_RETURN_POLICY:
                $title = $this->__('Return');
                break;
            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_SELLING_FORMAT:
                $title = $this->__('Selling');
                break;
            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_DESCRIPTION:
                $title = $this->__('Description');
                break;
            case \Ess\M2ePro\Model\Ebay\Template\Manager::TEMPLATE_SYNCHRONIZATION:
                $title = $this->__('Synchronization');
                break;
        }

        return $title;
    }
}
