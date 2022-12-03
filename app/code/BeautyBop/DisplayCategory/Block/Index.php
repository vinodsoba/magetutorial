<?php
namespace BeautyBop\DisplayCategory\Block;


use Magento\Framework\View\Element\Template\Context;
use Magento\Catalog\Model\CategoryFactory;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory as ProductCollectionFactory;

class Index extends \Magento\Framework\View\Element\Template
{
        protected $_categoryFactory;
        protected $_productCollectionFactory;

    public function __construct(
        Context $context,
        CategoryFactory $categoryFactory,
        ProductCollectionFactory $productCollectionFactory,
        array $data = []
    )
    {
        $this->_categoryFactory = $categoryFactory;
        $this->_productCollectionFactory = $productCollectionFactory;
        parent::__construct($context, $data);
    }

    public function _prepareLayout()
    {
        return parent::_prepareLayout();
    }

    public function getAllCategoryProducts($_categoryID)
    {
        return $this->getProductCollection($_categoryID);
    }

    public function getProductCollection($_categoryID)
    {
        // get products in category and all child categories
        //
        $_category=$this->_categoryFactory->create()->load($_categoryID);
        $_categoriesFilter = [
            'eq' => $_category->getAllChildren(true)
        ];

        $_productCollection = $this->_productCollectionFactory->create();
        $_productCollection->addCategoriesFilter($_categoriesFilter);
        $_productCollection->addAttributeToSelect('*');

        return $_productCollection;
    }

}
?>