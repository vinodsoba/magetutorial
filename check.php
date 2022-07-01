<?php
echo "Cronrun";

use Magento\Framework\AppInterface;
try {
    require_once __DIR__ . '/app/bootstrap.php';

} catch (\Exception $e) {
    echo 'Autoload error: ' . $e->getMessage();
    exit(1);
}
try{
    $bootstrap = \Magento\Framework\App\Bootstrap::create(BP, $_SERVER);
    $objectManager = $bootstrap->getObjectManager();
    $appState = $objectManager->get('\Magento\Framework\App\State');
    $appState->setAreaCode('frontend');
    $custompricehelper = $objectManager->create('BeautyBop\ApiPricing\Cron\Cronrun');
    $custompricehelper->execute();
    echo 'Manually Cron Running Successfully.....';
}
catch(\Exception $e){
    print_r($e->getMessage());
}