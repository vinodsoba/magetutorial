<?php
/**
 * @category FishPig
 * @package  FishPig_WordPress
 * @author   Ben Tideswell <help@fishpig.co.uk>
 */
namespace FishPig\WordPress\Block\Sidebar\Widget;

class Cloud extends AbstractWidget
{
    /**
     * @auto
     */
    protected $termCollectionFactory = null;

    /**
     * @param  \Magento\Framework\View\Element\Template\Context $context,
     * @param  \FishPig\WordPress\Block\Context $wpContext,
     * @param  array $data = []
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \FishPig\WordPress\Block\Context $wpContext,
        \FishPig\WordPress\Model\ResourceModel\Term\CollectionFactory $termCollectionFactory,
        array $data = []
    ) {
        $this->termCollectionFactory = $termCollectionFactory;
        parent::__construct($context, $wpContext, $data);
    }
        
    /**
     * Retrieve a collection of tags
     *
     * @return FishPig\WordPress\Model_Mysql4_Post_Tag_Collection
     */
    public function getTags()
    {
        if ($this->hasTags()) {
            return $this->_getData('tags');
        }

        $this->setTags(false);

        $tags = $this->termCollectionFactory->create()
            ->addCloudFilter($this->getTaxonomy())
            ->setOrderByName()
            ->load();

        if (count($tags) > 0) {
            $max = 0;
            $hasPosts = false;

            foreach ($tags as $tag) {
                $max = $tag->getCount() > $max ? $tag->getCount() : $max;

                if ($tag->getCount() > 0) {
                    $hasPosts = true;
                }
            }

            if ($hasPosts) {
                $this->setMaximumPopularity($max);
                $this->setTags($tags);
            }
        }

        return $this->getData('tags');
    }

    /**
     * Retrieve a font size for a tag
     *
     * @param  Varien_Object $tag
     * @return int
     */
    public function getFontSize($tag)
    {
        if ($this->getMaximumPopularity() > 0) {
            $percentage = ($tag->getCount() * 100) / $this->getMaximumPopularity();

            foreach ($this->getFontSizes() as $percentageLimit => $default) {
                if ($percentage <= $percentageLimit) {
                    return $default;
                }
            }
        }

        return 150;
    }

    /**
     * Retrieve the default title
     *
     * @return string
     */
    public function getDefaultTitle()
    {
        return __('Tag Cloud');
    }

    /**
     * Retrieve an array of font sizes
     *
     * @return array
     */
    public function getFontSizes()
    {
        if (!$this->hasFontSizes()) {
            return [
                25 => 90,
                50 => 100,
                75 => 120,
                90 => 140,
                100 => 150
            ];
        }

        return $this->_getData('font_sizes');
    }

    /**
     *
     */
    protected function _beforeToHtml()
    {
        if (!$this->getTemplate()) {
            $this->setTemplate('FishPig_WordPress::sidebar/widget/cloud.phtml');
        }

        return parent::_beforeToHtml();
    }
}
