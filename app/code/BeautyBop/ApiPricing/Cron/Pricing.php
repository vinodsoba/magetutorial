<?php

namespace BeautyBop\ApiPricing\Cron;

use BeautyBop\ApiPricing\Helper\Data;
use BeautyBop\ApiPricing\Logger\Logger;
use \Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use \Magento\Catalog\Model\ProductRepository;
class Pricing
{
    protected $_logger;
    protected $helperinventoryupdate;
    protected $_productFactory;
    protected $_ProductRepository;

    public function __construct(
        Data $helperinventoryupdate, Logger $logger, CollectionFactory $productFactory,
        ProductRepository $_ProductRepository
    )
    {
        $this->helperinventoryupdate = $helperinventoryupdate;
        $this->_logger = $logger;
        $this->_productFactory = $productFactory;
        $this->_ProductRepository = $_ProductRepository;
    }

    public function execute()
    {
        if ($this->helperinventoryupdate->isEnabled()) {
            try {

                $apiusername = $this->helperinventoryupdate->Apiusername();
                $apipassword = $this->helperinventoryupdate->Apipassword();
                $schemalocationapiurl = $this->helperinventoryupdate->Schemalocationapiurl();
                $endpointsapiurl = $this->helperinventoryupdate->Endpointsapiurl();

                $mode = "false";
                if ($this->helperinventoryupdate->Testmodecheck()) {
                    $mode = "true";
                }

                $current_date = gmDate("Y-m-d\TH:i:s\Z");
                $nasc = substr(md5(uniqid($apipassword, true)), 0, 16);
                $nonce = base64_encode($nasc);

                $auth = new \stdClass();
                $auth->Username = $apiusername;
                $auth->Nonce = $nonce;
                $auth->Created = $current_date;
                $auth->Password = base64_encode(sha1($auth->Nonce . $auth->Created . $apipassword));

                $soapClient = new \SoapClient($schemalocationapiurl, ['trace' => true, 'cache_wsdl' => WSDL_CACHE_MEMORY]);

                $headers = new \SoapHeader($endpointsapiurl, 'AuthHeader', $auth);

                // Prepare Soap Client Header
                $soapClient->__setSoapHeaders($headers);

                // Setup body the GetStockFile parameters
                $ap_param['TestMode'] = $mode;
                $ap_param['StockFileFormat'] = "JSON";
                $ap_param['FieldDelimiter'] = ",";
                $ap_param['StockFileFields']['StockFileField'] = "Price";
                $ap_param['SortBy'] = "StockLevel";

                $response = $soapClient->GetStockFile($ap_param);

                $stockdatarray = json_decode($response->File, true);

                $this->_logger->info('**************** Current Date **************** ::');
                $this->_logger->info(gmDate("Y-m-d H:i:s"));

                

                $api_product_sku_array = array();
                foreach ($stockdatarray as $value) {
                    /*print_r($value['Quantity']);
                    print_r($value['StockLevel']); */

                    $api_product_sku_array [] = $value['Price'];
                    $productcollection = $this->_productFactory->create()->addAttributeToFilter('sku', ['eq' => $value['StockCode']]);

                    //Convert price with 15% increase
                    $updatePrice = $value['Price'];
                    
                    print_r($updatePrice);
    
                    $shipping = 3.35;
                    $vat = 20;
                    $ebayfees = 10; //5% ebay fees
                    $profit = 15; //5% profit

                    // 20 + 3.35 = 23.35
                    $total = $updatePrice + $shipping;


                    // 23.35 * 20% = 4.67
                    $calculatevat = $total * 20 /100;


                    // inc VAT 23.35 + 4.67 = 28.02
                    $totalinc = $total + $calculatevat;

                    //calculate ebay fees ontop of total
                    // 28.02 * 10% = 2 .80 
                    $a = $totalinc * $ebayfees / 100;


                    // 28.02 + 2.80 = 30.82
                    $subtotal = $totalinc + $a;

                    //bbop profit at 15%
                    // 30.82 * 15% = 4.62;
                    $bbopsubtotal = $subtotal * $profit / 100;

                    // 30.82 + 4.62 = 35.44
                    $bboptotal = $subtotal + $bbopsubtotal;

                    $price = number_format($bboptotal,2);
    
                  
                    print_r($price);

                    if ($productcollection->getData()) {
                        $this->_logger->info('****************  StockCode **************** ::');
                        $this->_logger->info($value['StockCode']);

                        $this->_logger->info('**************** Price **************** ::');
                        $this->_logger->info($price);

                        
                        $productData = $productcollection->getData();
                        $product = $this->_ProductRepository->get($productData[0]['sku']);
                        $product->getExtensionAttributes()->getStockItem();
                        $product->setPrice($price);
                        //$stockItem->setIsInStock($value['StockLevel'] > 0 ? 1 : 0);*/
                        $product->save();
                    }

                }

                if (!empty($api_product_sku_array)) {
                    $get_all_product_collection_not_in_api = $this->_productFactory->create()->addFieldToFilter('sku', array('nin' => $api_product_sku_array));
                    foreach ($get_all_product_collection_not_in_api as $product_data_not_in_api) {
                        $this->_logger->info('**************** Set Product Quantity as a zero.  ****************');
                        $this->_logger->info($product_data_not_in_api->getSku());
                        $product = $this->_ProductRepository->get($product_data_not_in_api->getSku());
                        $stockItem = $product->getExtensionAttributes()->getStockItem();
                        $stockItem->setQty(0);
                        $stockItem->setIsInStock(0);
                        $product->save();
                    }
                    $this->_logger->info('**************** Stop  ****************');
                }
            } catch (SoapFault $fault) {
                $this->_logger->info("***** Error SoapFault *****");
                $this->_logger->info("***** Error SoapFault this is my code *****");
                $this->_logger->info('***** $fault->faultcode *****"');
                $this->_logger->info($fault->faultcode);
                $this->_logger->info('***** $fault->faultstring *****"');
                $this->_logger->info($fault->faultstring);
            } catch (\Exception $e) {
                $this->_logger->info("***** Error  Exception*****");
                $this->_logger->info($e->getMessage());
            }
        }
    }
}