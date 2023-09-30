<?php
/**
 *
 */
namespace FishPig\WordPress\Block\Sidebar\Widget;

class Text extends AbstractWidget
{
    /**
     * @return string
     */
    public function getDefaultTitle()
    {
        return null;
    }

    /**
     * @return AbstractWidget
     */
    protected function _beforeToHtml()
    {
        if (!$this->getTemplate()) {
            $this->setTemplate('FishPig_WordPress::sidebar/widget/text.phtml');
        }

        return parent::_beforeToHtml();
    }
    
    /**
     * @return string
     */
    public function getWidgetText()
    {
        return $this->renderShortcode($this->getData('text'));
    }
    
    /**
     * @return string
     */
    public function getText()
    {
        return $this->getWidgetText();
    }
}
