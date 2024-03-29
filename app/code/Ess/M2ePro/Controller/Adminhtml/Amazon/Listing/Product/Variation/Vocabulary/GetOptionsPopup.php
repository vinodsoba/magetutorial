<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Controller\Adminhtml\Amazon\Listing\Product\Variation\Vocabulary;

use Ess\M2ePro\Block\Adminhtml\Amazon\Listing\Product\Variation\VocabularyOptionsPopup;
use Ess\M2ePro\Controller\Adminhtml\Amazon\Main;

/**
 * Class \Ess\M2ePro\Controller\Adminhtml\Amazon\Listing\Product\Variation\Vocabulary\GetOptionsPopup
 */
class GetOptionsPopup extends Main
{
    public function execute()
    {
        $block = $this->getLayout()->createBlock(VocabularyOptionsPopup::class);

        $this->setAjaxContent($block);

        return $this->getResult();
    }
}
