<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Block\Adminhtml\ControlPanel\Tabs\Command;

use Ess\M2ePro\Block\Adminhtml\Magento\AbstractBlock;

class Group extends AbstractBlock
{
    /** @var \Ess\M2ePro\Helper\View\ControlPanel\Command */
    protected $controlPanelCommandHelper;
    /** @var \Ess\M2ePro\Helper\Component */
    private $componentHelper;

    public function __construct(
        \Ess\M2ePro\Helper\View\ControlPanel\Command $controlPanelCommandHelper,
        \Ess\M2ePro\Helper\Component $componentHelper,
        \Ess\M2ePro\Block\Adminhtml\Magento\Context\Template $context,
        array $data = []
    ) {
        parent::__construct($context, $data);
        $this->controlPanelCommandHelper = $controlPanelCommandHelper;
        $this->componentHelper = $componentHelper;
    }

    public function _construct()
    {
        parent::_construct();

        $this->setTemplate('control_panel/tabs/command/group.phtml');
    }

    protected function _beforeToHtml()
    {
        $this->enabledComponents = $this->componentHelper->getEnabledComponents();

        $this->commands = $this->controlPanelCommandHelper
                            ->parseGeneralCommandsData($this->getControllerName());

        return parent::_beforeToHtml();
    }

    public function getCommandLauncherHtml(array $commandRow, $component = null)
    {
        $href = $commandRow['url'];
        $component && $href = rtrim($commandRow['url'], '/')."/component/{$component}/";

        $target = '';
        $commandRow['new_window'] && $target = 'target="_blank"';

        $onClick = '';
        $commandRow['confirm'] && $onClick = "return confirm('{$commandRow['confirm']}');";
        if (!empty($commandRow['prompt']['text']) && !empty($commandRow['prompt']['var'])) {
            $onClick =  <<<JS
var result = prompt('{$commandRow['prompt']['text']}');
if (result) window.location.href = $(this).getAttribute('href') + '?{$commandRow['prompt']['var']}=' + result;
return false;
JS;
        }

        $title = $commandRow['title'];
        $component && $title = $component;

        return <<<HTML
<a href="{$href}" {$target} onclick="{$onClick}" title="{$commandRow['description']}">{$title}</a>
HTML;
    }
}
