<?php

/*
 * @author     M2E Pro Developers Team
 * @copyright  M2E LTD
 * @license    Commercial use is forbidden
 */

namespace Ess\M2ePro\Setup\Upgrade\v1_23_2__v1_24_0;

use Ess\M2ePro\Model\Setup\Upgrade\Entity\AbstractConfig;

class Config extends AbstractConfig
{
    public function getFeaturesList()
    {
        return [
            '@y22_m06/EbayFixedPriceModifier',
            '@y22_m06/WalmartOrderItemBuyerCancellation'
        ];
    }
}
