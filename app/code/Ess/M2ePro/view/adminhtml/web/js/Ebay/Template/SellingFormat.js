define([
    'Magento_Ui/js/modal/modal',
    'M2ePro/Common'
], function (modal) {

    window.EbayTemplateSellingFormat = Class.create(Common, {

        charityIndex: 0,
        charityTpl: '',
        priceChangeIndex: 0,
        priceChangeTpl: '',

        constAbsoluteIncrease: M2ePro.php.constant(
                '\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_ABSOLUTE_INCREASE'
        ),
        constAbsoluteDecrease: M2ePro.php.constant(
                '\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_ABSOLUTE_DECREASE'
        ),
        constPercentageIncrease: M2ePro.php.constant(
                '\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_PERCENTAGE_INCREASE'
        ),
        constPercentageDecrease: M2ePro.php.constant(
                '\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_PERCENTAGE_DECREASE'
        ),
        constAttribute: M2ePro.php.constant(
                '\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_ATTRIBUTE'
        ),

        // ---------------------------------------

        initialize: function ()
        {
            var self = this;
            jQuery.validator.addMethod('M2ePro-validate-price-coefficient', function (value, el) {

                var tempEl = el;

                if (self.isElementHiddenFromPage(el)) {
                    return true;
                }

                var coefficient = el.up().next().down('input');

                coefficient.removeClassName('price_unvalidated');

                if (!coefficient.up('div').visible()) {
                    return true;
                }

                if (coefficient.value == '') {
                    return false;
                }

                var floatValidator = Validation.get('M2ePro-validation-float');
                if (floatValidator.test($F(coefficient), coefficient) && parseFloat(coefficient.value) <= 0) {
                    coefficient.addClassName('price_unvalidated');
                    return false;
                }

                return true;
            }, M2ePro.translator.translate('Price Change is not valid.'));

            jQuery.validator.addMethod('M2ePro-validate-price-modifier', function (value, el) {
                if (self.isElementHiddenFromPage(el)) {
                    return true;
                }

                var coefficient = el.up().next().down('input');

                coefficient.removeClassName('price_unvalidated');

                if (!coefficient.visible()) {
                    return true;
                }

                if (coefficient.value == '') {
                    return false;
                }

                var floatValidator = Validation.get('M2ePro-validation-float');
                if (floatValidator.test($F(coefficient), coefficient) && parseFloat(coefficient.value) <= 0) {
                    coefficient.addClassName('price_unvalidated');
                    return false;
                }

                return true;
            }, M2ePro.translator.translate('Price Change is not valid.'));

            jQuery.validator.addMethod('M2ePro-validate-qty', function (value, el) {

                if (self.isElementHiddenFromPage(el)) {
                    return true;
                }

                if (value.match(/[^\d]+/g) || value <= 0) {
                    return false;
                }

                return true;
            }, M2ePro.translator.translate('Wrong value. Only integer numbers.'));

            jQuery.validator.addMethod('M2ePro-validate-vat', function (value, el) {

                if (self.isElementHiddenFromPage(el)) {
                    return true;
                }

                if (!value) {
                    return true;
                }

                if (value.length > 6) {
                    return false;
                }

                if (value < 0) {
                    return false;
                }

                value = Math.ceil(value);

                return value >= 0 && value <= 30;
            }, M2ePro.translator.translate('wrong_value_more_than_30'));

            jQuery.validator.addMethod('M2ePro-lot-size', function(value) {

                if (!value) {
                    return true;
                }

                var numValue = parseNumber(value);
                if (isNaN(numValue)) {
                    return false;
                }

                return numValue >= 2 && numValue <= 100000;
            }, M2ePro.translator.translate('Wrong value. Lot Size must be from 2 to 100000 Items.'));

            jQuery.validator.addMethod('M2ePro-validation-charity-percentage', function (value, element) {

                if (value == 0) {
                    return false;
                }

                return true;
            }, M2ePro.translator.translate('Please select a percentage of donation'));

            var charityRowTemplate = $('charity_row_template');
            if (charityRowTemplate) {
                this.charityTpl = charityRowTemplate.down('tbody').innerHTML;
                charityRowTemplate.remove();
            }

            var priceChangeRowTemplate = $('fixed_price_change_row_template');
            if (priceChangeRowTemplate) {
                this.priceChangeTpl = priceChangeRowTemplate.innerHTML;
                priceChangeRowTemplate.remove();
            }
        },

        initObservers: function()
        {
            $('listing_type')
                .observe('change', EbayTemplateSellingFormatObj.listing_type_change)
                .simulate('change');

            $('duration_attribute')
                .observe('change', EbayTemplateSellingFormatObj.duration_attribute_change)
                .simulate('change');

            $('qty_mode')
                .observe('change', EbayTemplateSellingFormatObj.qty_mode_change)
                .simulate('change');

            $('qty_modification_mode')
                .observe('change', EbayTemplateSellingFormatObj.qtyPostedMode_change)
                .simulate('change');

            $('lot_size_mode')
                .observe('change', EbayTemplateSellingFormatObj.lotSizeMode_change)
                .simulate('change');

            $('vat_mode')
                .observe('change', EbayTemplateSellingFormatObj.vatModeChange)
                .simulate('change');

            if ($('tax_category_mode')) {
                $('tax_category_mode')
                    .observe('change', EbayTemplateSellingFormatObj.taxCategoryChange)
                    .simulate('change');
            }

            $('fixed_price_mode')
                .observe('change', EbayTemplateSellingFormatObj.fixed_price_mode_change)
                .simulate('change');

            $('start_price_mode')
                .observe('change', EbayTemplateSellingFormatObj.start_price_mode_change)
                .simulate('change');

            $('reserve_price_mode')
                .observe('change', EbayTemplateSellingFormatObj.reserve_price_mode_change)
                .simulate('change');

            $('buyitnow_price_mode')
                .observe('change', EbayTemplateSellingFormatObj.buyitnow_price_mode_change)
                .simulate('change');

            $('price_discount_stp_mode')
                .observe('change', EbayTemplateSellingFormatObj.price_discount_stp_mode_change)
                .simulate('change');

            $('price_discount_map_mode')
                .observe('change', EbayTemplateSellingFormatObj.price_discount_map_mode_change)
                .simulate('change');

            $$('.price_coefficient_mode').each(function(element){
                element.observe('change', EbayTemplateSellingFormatObj.price_coefficient_mode_change)
                    .simulate('change');
            });

            $('best_offer_mode')
                .observe('change', EbayTemplateSellingFormatObj.best_offer_mode_change)
                .simulate('change');

            $('best_offer_accept_mode')
                .observe('change', EbayTemplateSellingFormatObj.best_offer_accept_mode_change)
                .simulate('change');

            $('best_offer_reject_mode')
                .observe('change', EbayTemplateSellingFormatObj.best_offer_reject_mode_change)
                .simulate('change');

            EbayTemplateSellingFormatObj.checkPriceMessages();
            $(
                'fixed_price_mode',
                'start_price_mode',
                'reserve_price_mode',
                'buyitnow_price_mode',
                'price_discount_stp_mode',
                'price_discount_map_mode'
            )
                .invoke('observe', 'change', function() {
                    EbayTemplateSellingFormatObj.checkPriceMessages();
                }
            );

            EbayTemplateSellingFormatObj.checkBestOfferMessages();
            $(
                'best_offer_accept_mode',
                'best_offer_reject_mode'
            )
                .invoke('observe', 'change', function () {
                    EbayTemplateSellingFormatObj.checkBestOfferMessages();
                }
            );
        },

        // ---------------------------------------

        isStpAvailable: function () {
            return M2ePro.formData.isStpEnabled;
        },

        isMapAvailable: function () {
            return M2ePro.formData.isMapEnabled;
        },

        isStpAdvancedAvailable: function () {
            return M2ePro.formData.isStpAdvancedEnabled;
        },

        // ---------------------------------------

        listing_type_change: function (event) {
            var self = EbayTemplateSellingFormatObj,

                bestOfferBlock = $('magento_block_ebay_template_selling_format_edit_form_best_offer-wrapper'),
                bestOfferMode = $('best_offer_mode'),
                attributeElement = $('listing_type_attribute');

            $('fixed_price_tr', 'start_price_tr', 'reserve_price_tr', 'buyitnow_price_tr').invoke('show');
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_FIXED')) {
                $('start_price_tr', 'reserve_price_tr', 'buyitnow_price_tr').invoke('hide');
                $$('#variation_price_tr .value').invoke('show');
            }

            attributeElement.innerHTML = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }

            bestOfferBlock.show();
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                $('fixed_price_tr').hide();
                bestOfferBlock.hide();
                bestOfferMode.value = M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::BEST_OFFER_MODE_NO');
                bestOfferMode.simulate('change');
            }

            self.updateQtyMode();
            self.updateQtyPercentage();
            self.updateIgnoreVariations();
            self.updateLotSize();
            self.updateListingDuration();
            self.updateFixedPrice();
            self.updatePriceDiscountStpVisibility();
            self.updatePriceDiscountMapVisibility();
            self.updateVariationPriceTrVisibility();
        },

        duration_attribute_change: function () {
            EbayTemplateSellingFormatObj.updateHiddenValue(this, $('listing_duration_attribute_value'));
        },

        updateQtyMode: function () {
            var qtyMode        = $('qty_mode'),
                qtyModeTr      = $('qty_mode_tr'),
                qtyCustomValue = $('qty_custom_value'),
                customValueTr  = $('qty_mode_cv_tr');

            qtyModeTr.show();
            qtyMode.simulate('change');
            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                qtyMode.value = M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_NUMBER');
                qtyCustomValue.value = 1;
                qtyMode.simulate('change');
                qtyModeTr.hide();
                customValueTr.hide();
            }
        },

        updateQtyPercentage: function () {
            var qtyPercentageTr = $('qty_percentage_tr');

            qtyPercentageTr.hide();

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                return;
            }

            var qtyMode = $('qty_mode').value;

            if (qtyMode == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_NUMBER')) {
                return;
            }

            qtyPercentageTr.show();
        },

        updateIgnoreVariations: function () {
            var ignoreVariationsValueTr = $('ignore_variations_value_tr'),
                ignoreVariationsValue = $('ignore_variations_value');

            ignoreVariationsValueTr.hide();

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                ignoreVariationsValue.value = 0;
            } else {
                ignoreVariationsValueTr.show();
            }
        },

        updateLotSize: function()
        {
            var lotSizeCustomValueTr = $('lot_size_cv_tr');

            if ($('lot_size_mode').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LOT_SIZE_MODE_CUSTOM_VALUE')) {
                lotSizeCustomValueTr.show();
            } else {
                lotSizeCustomValueTr.hide();
                $('lot_size_custom_value').value = '';
            }
        },

        updateListingDuration: function () {
            var durationMode = $('duration_mode_container'),
                durationModeValue = $('duration_mode'),
                durationAttribute = $('duration_attribute_container');

            $$('.durationId').invoke('show');
            $$('.duration_note').invoke('hide');
            durationAttribute.hide();
            durationMode.show();

            durationModeValue.removeClassName('disabled');

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_FIXED')) {

                $$('.durationId').invoke('hide');
                $('durationId100').show();

                durationModeValue.addClassName('disabled');
                durationModeValue.value = 100;
                $$('.duration_fixed_note').invoke('show');
            }

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {

                durationModeValue.value = 3;

                $('durationId30', 'durationId100').invoke('hide');
                if (M2ePro.formData.duration_mode && M2ePro.formData.duration_mode != 30 && M2ePro.formData.duration_mode != 100) {
                    durationModeValue.value = M2ePro.formData.duration_mode;
                }

                $$('.duration_auction_note').invoke('show');
            }

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_ATTRIBUTE')) {
                durationMode.hide();
                durationAttribute.show();
                $$('.duration_attribute_note').invoke('show');
            }
        },

        updateVariationPriceTrVisibility: function () {
            var removeBottomBorderTds = $$('#fixed_price_tr td.remove_bottom_border'),
                addRowspanTds = $$('#fixed_price_tr td.add_rowspan'),
                priceModeSelect = $('fixed_price_mode'),
                variationPriceTr = $('variation_price_tr');

            variationPriceTr.hide();
            removeBottomBorderTds.invoke('removeClassName', 'bottom_border_disabled');
            addRowspanTds.invoke('removeAttribute', 'rowspan');

            if ($('listing_type').value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                variationPriceTr.show();
                addRowspanTds.invoke('setAttribute', 'rowspan', '2');
                if (priceModeSelect.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE')) {
                    removeBottomBorderTds.invoke('addClassName', 'bottom_border_disabled');
                }
            }
        },

        updateFixedPrice: function () {
            var priceLabel = $('fixed_price_label'),
                bestOfferAcceptPercentageOption = $('best_offer_accept_percentage_option'),
                bestOfferRejectPercentageOption = $('best_offer_reject_percentage_option');

            priceLabel.innerHTML = M2ePro.translator.translate('Fixed Price') + ': ';
            bestOfferAcceptPercentageOption.innerHTML = M2ePro.translator.translate('% of Fixed Price');
            bestOfferRejectPercentageOption.innerHTML = M2ePro.translator.translate('% of Fixed Price');

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_FIXED')) {
                priceLabel.innerHTML = M2ePro.translator.translate('Price') + ': ';
                bestOfferAcceptPercentageOption.innerHTML = M2ePro.translator.translate('% of Price');
                bestOfferRejectPercentageOption.innerHTML = M2ePro.translator.translate('% of Price');
            }
        },

        updatePriceDiscountStpVisibility: function () {
            var priceDiscTrStp = $('price_discount_stp_tr'),
                priceDiscStpMode = $('price_discount_stp_mode');

            priceDiscTrStp.hide();
            if (EbayTemplateSellingFormatObj.isStpAvailable()) {
                priceDiscTrStp.show();
            }

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                priceDiscTrStp.hide();
                priceDiscStpMode.value = M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE');
                priceDiscStpMode.simulate('change');
            }
        },

        updatePriceDiscountMapVisibility: function () {
            var priceDiscTrMap = $('price_discount_map_tr'),
                priceDiscMapMode = $('price_discount_map_mode');

            priceDiscTrMap.hide();
            if (EbayTemplateSellingFormatObj.isMapAvailable()) {
                priceDiscTrMap.show();
            }

            if ($('listing_type').value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                priceDiscTrMap.hide();
                priceDiscMapMode.value = M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE');
                priceDiscMapMode.simulate('change');
            }
        },

        // ---------------------------------------

        qty_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,

                customValueTr = $('qty_mode_cv_tr'),
                attributeElement = $('qty_custom_attribute'),

                maxPostedValueTr = $('qty_modification_mode_tr'),
                maxPostedValueMode = $('qty_modification_mode');

            customValueTr.hide();
            attributeElement.value = '';

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_NUMBER')) {
                customValueTr.show();
            } else if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }

            maxPostedValueTr.hide();
            maxPostedValueMode.value = M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::QTY_MODIFICATION_MODE_OFF');

            if (self.isMaxPostedQtyAvailable(this.value)) {

                maxPostedValueTr.show();
                maxPostedValueMode.value = M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::QTY_MODIFICATION_MODE_ON');

                if (self.isMaxPostedQtyAvailable(M2ePro.formData.qty_mode)) {
                    maxPostedValueMode.value = M2ePro.formData.qty_modification_mode;
                }
            }

            maxPostedValueMode.simulate('change');

            self.updateQtyPercentage();
        },

        isMaxPostedQtyAvailable: function (qtyMode) {
            return qtyMode == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_PRODUCT') ||
                qtyMode == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_ATTRIBUTE') ||
                qtyMode == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::QTY_MODE_PRODUCT_FIXED');
        },

        qtyPostedMode_change: function () {
            var minPosterValueTr = $('qty_min_posted_value_tr'),
                maxPosterValueTr = $('qty_max_posted_value_tr');

            minPosterValueTr.hide();
            maxPosterValueTr.hide();

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::QTY_MODIFICATION_MODE_ON')) {
                minPosterValueTr.show();
                maxPosterValueTr.show();
            }
        },

        lotSizeMode_change: function()
        {
            var self = EbayTemplateSellingFormatObj,

                lotSizeCustomValueTr = $('lot_size_cv_tr'),
                attributeElement   = $('lot_size_attribute');

            lotSizeCustomValueTr.hide();
            attributeElement.value = '';

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LOT_SIZE_MODE_CUSTOM_VALUE')) {
                lotSizeCustomValueTr.show();
            } else if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LOT_SIZE_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }

            if (this.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LOT_SIZE_MODE_CUSTOM_VALUE')) {
                $('lot_size_custom_value').value = '';
            }
        },

        // ---------------------------------------

        vatModeChange: function () {
            var vatPercentTr = $('vat_percent_tr');

            vatPercentTr.hide();

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::VAT_MODE_YES')) {
                vatPercentTr.show();
            }
        },

        // ---------------------------------------

        taxCategoryChange: function () {
            var self = EbayTemplateSellingFormatObj,
                valueEl = $('tax_category_value'),
                attributeEl = $('tax_category_attribute');

            valueEl.value = '';
            attributeEl.value = '';

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::TAX_CATEGORY_MODE_VALUE')) {
                self.updateHiddenValue(this, valueEl);
            }

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::TAX_CATEGORY_MODE_ATTRIBUTE')) {
                self.updateHiddenValue(this, attributeEl);
            }
        },

        // ---------------------------------------

        fixed_price_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,
                listingType = $('listing_type'),
                currencyTd = $('fixed_price_currency_td'),
                attributeElement = $('fixed_price_custom_attribute'),
                priceChangeTd = $('fixed_price_change_td'),
                priceChangeTds = $$('#fixed_price_tr td.remove_bottom_border'),
                variationPriceSelect = $$('#variation_price_tr .value');

            variationPriceSelect.invoke('hide');
            priceChangeTds.invoke('removeClassName', 'bottom_border_disabled');
            priceChangeTd.hide();
            currencyTd && currencyTd.hide();

            if (this.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE')) {
                priceChangeTd.show();
                currencyTd && currencyTd.show();
                variationPriceSelect.invoke('show');
                if (listingType.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::LISTING_TYPE_AUCTION')) {
                    priceChangeTds.invoke('addClassName', 'bottom_border_disabled');
                }
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }
        },

        start_price_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,
                attributeElement = $('start_price_custom_attribute');

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }
        },

        reserve_price_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,
                attributeElement = $('reserve_price_custom_attribute'),
                priceChangeTd = $('reserve_price_change_td'),
                currencyTd = $('reserve_price_currency_td');

            priceChangeTd.hide();
            currencyTd && currencyTd.hide();

            if (this.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE')) {
                priceChangeTd.show();
                currencyTd && currencyTd.show();
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }
        },

        buyitnow_price_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,
                attributeElement = $('buyitnow_price_custom_attribute'),
                priceChangeTd = $('buyitnow_price_change_td'),
                currencyTd = $('buyitnow_price_currency_td');

            priceChangeTd.hide();
            currencyTd && currencyTd.hide();

            if (this.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE')) {
                priceChangeTd.show();
                currencyTd && currencyTd.show();
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }
        },

        price_coefficient_mode_change: function () {
            var coefficientInputDiv = $(this.id.replace('mode', '') + 'input_div'),
                signSpan = $(this.id.replace('mode', '') + 'sign_span'),
                percentSpan = $(this.id.replace('mode', '') + 'percent_span'),
                examplesContainer = $(this.id.replace('coefficient_mode', '') + 'example_container');

            // ---------------------------------------

            coefficientInputDiv.show();
            examplesContainer.show();

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_NONE')) {
                coefficientInputDiv.hide();
                examplesContainer.hide();
            }
            // ---------------------------------------

            // ---------------------------------------
            signSpan.innerHTML = '';
            percentSpan.innerHTML = '';
            $$('.' + this.id.replace('coefficient_mode', '') + 'example').invoke('hide');

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_ABSOLUTE_INCREASE')) {
                signSpan.innerHTML = '+';

                if (typeof M2ePro.formData.currency != 'undefined') {
                    percentSpan.innerHTML = M2ePro.formData.currency;
                }

                $(this.id.replace('coefficient_mode', '') + 'example_absolute_increase').show();
            }

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_ABSOLUTE_DECREASE')) {
                signSpan.innerHTML = '-';

                if (typeof M2ePro.formData.currency != 'undefined') {
                    percentSpan.innerHTML = M2ePro.formData.currency;
                }

                $(this.id.replace('coefficient_mode', '') + 'example_absolute_decrease').show();
            }

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_PERCENTAGE_INCREASE')) {
                signSpan.innerHTML = '+';
                percentSpan.innerHTML = '%';

                $(this.id.replace('coefficient_mode', '') + 'example_percentage_increase').show();
            }

            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::PRICE_COEFFICIENT_PERCENTAGE_DECREASE')) {
                signSpan.innerHTML = '-';
                percentSpan.innerHTML = '%';

                $(this.id.replace('coefficient_mode', '') + 'example_percentage_decrease').show();
            }
            // ---------------------------------------
        },

        price_discount_stp_mode_change: function () {
            var attributeElement = $('price_discount_stp_attribute'),
                priceDiscountStpTds = $$('#price_discount_stp_tr td.remove_bottom_border'),
                priceDiscountStpReasonTr = $('price_discount_stp_reason_tr'),
                currencyTd = $('price_discount_stp_currency_td');

            priceDiscountStpReasonTr.hide();
            currencyTd && currencyTd.hide();
            priceDiscountStpTds.invoke('removeClassName', 'bottom_border_disabled');

            if (this.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE')) {
                currencyTd && currencyTd.show();

                if (EbayTemplateSellingFormatObj.isStpAdvancedAvailable()) {
                    priceDiscountStpReasonTr.show();
                    priceDiscountStpTds.invoke('addClassName', 'bottom_border_disabled');
                }
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_ATTRIBUTE')) {
                EbayTemplateSellingFormatObj.selectMagentoAttribute(this, attributeElement);
            }
        },

        price_discount_map_mode_change: function () {
            var attributeElement = $('price_discount_map_attribute'),
                priceDiscountMapExposureTr = $('price_discount_map_exposure_tr'),
                currencyTd = $('price_discount_map_currency_td');

            priceDiscountMapExposureTr.hide();
            currencyTd && currencyTd.hide();

            if (this.value != M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_NONE')) {
                currencyTd && currencyTd.show();

                if (EbayTemplateSellingFormatObj.isMapAvailable()) {
                    priceDiscountMapExposureTr.show();
                }
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Template\\SellingFormat::PRICE_MODE_ATTRIBUTE')) {
                EbayTemplateSellingFormatObj.selectMagentoAttribute(this, attributeElement);
            }
        },

        // ---------------------------------------

        best_offer_mode_change: function () {
            var bestOfferRespondTable = $$('.best_offer_respond_table_container');

            bestOfferRespondTable.invoke('hide');
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::BEST_OFFER_MODE_YES')) {
                bestOfferRespondTable.invoke('show');
                $('best_offer_reject_mode', 'best_offer_accept_mode').invoke('simulate', 'change');
            } else {
                $('template_selling_format_messages_best_offer').innerHTML = '';
            }
        },

        best_offer_accept_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,

                bestOfferAcceptValueTr = $('best_offer_accept_value_tr'),
                attributeElement = $('best_offer_accept_custom_attribute');

            bestOfferAcceptValueTr.hide();
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::BEST_OFFER_ACCEPT_MODE_PERCENTAGE')) {
                bestOfferAcceptValueTr.show();
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::BEST_OFFER_ACCEPT_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }
        },

        best_offer_reject_mode_change: function () {
            var self = EbayTemplateSellingFormatObj,
                bestOfferRejectValueTr = $('best_offer_reject_value_tr'),
                attributeElement = $('best_offer_reject_custom_attribute');

            bestOfferRejectValueTr.hide();
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::BEST_OFFER_REJECT_MODE_PERCENTAGE')) {
                bestOfferRejectValueTr.show();
            }

            attributeElement.value = '';
            if (this.value == M2ePro.php.constant('\\Ess\\M2ePro\\Model\\Ebay\\Template\\SellingFormat::BEST_OFFER_REJECT_MODE_ATTRIBUTE')) {
                self.selectMagentoAttribute(this, attributeElement);
            }
        },

        // ---------------------------------------

        selectMagentoAttribute: function (elementSelect, elementAttribute) {
            var attributeCode = elementSelect.options[elementSelect.selectedIndex].getAttribute('attribute_code');
            elementAttribute.value = attributeCode;
        },

        // ---------------------------------------

        checkBestOfferMessages: function ()
        {
            var formElements = $(
                "best_offer_mode",
                "best_offer_accept_mode",
                "best_offer_accept_custom_attribute",
                "best_offer_reject_mode",
                "best_offer_reject_custom_attribute"
            );

            var isVisible = $$('.best_offer_respond_table_container').first().visible();
            if (!isVisible) {
                return false;
            }

            this.checkMessages(Form.serializeElements(formElements), 'template_selling_format_messages_best_offer')
        },

        checkPriceMessages: function ()
        {

            var formElements = Form.getElements('template_selling_format_data_container'),
                excludedElements = $(
                    "best_offer_mode",
                    "best_offer_accept_mode",
                    "best_offer_accept_custom_attribute",
                    "best_offer_reject_mode",
                    "best_offer_reject_custom_attribute"
                );

            formElements = formElements.filter(function (element) {
                return excludedElements.indexOf(element) < 0;
            });

            if (formElements.length === 0) {
                return false;
            }

            this.checkMessages(Form.serializeElements(formElements), 'template_selling_format_messages');
        },

        checkMessages: function (data, container)
        {
            if (typeof EbayListingTemplateSwitcherObj == 'undefined') {
                // not inside template switcher
                return;
            }

            var id = '',
                nick = M2ePro.php.constant('Ess_M2ePro_Model_Ebay_Template_Manager::TEMPLATE_SELLING_FORMAT'),
                storeId = EbayListingTemplateSwitcherObj.storeId,
                marketplaceId = EbayListingTemplateSwitcherObj.marketplaceId,
                callback = function () {
                    var refresh = $(container).down('a.refresh-messages');
                    if (refresh) {
                        refresh.observe('click', function () {
                            this.checkMessages(data, container);
                        }.bind(this))
                    }
                }.bind(this);

            TemplateManagerObj.checkMessages(
                id,
                nick,
                data,
                storeId,
                marketplaceId,
                container,
                callback
            );
        },

        // eBay Charity
        // ---------------------------------------

        renderCharities: function (data) {
            var self = this;

            $H(data).each(function (charity) {
                self.addCharityRow(charity.value);
            });
        },

        addCharityRow: function (charityData) {
            var self = this;

            $('charity_not_set_table').hide();
            $('charity_table').show();

            charityData = charityData || {};
            this.charityIndex++;

            var tpl = this.charityTpl;
            tpl = tpl.replace(/%i%/g, this.charityIndex);
            $('charity_table_tbody').insert(tpl);

            var row = $('charity_row_' + this.charityIndex + '_tr');
            row.show();

            var marketplaceEl = row.down('.charity-marketplace_id');

            if ($('charity_table_tbody').select('tr').length === (marketplaceEl.select('option').length - 1)) {
                $$('.add_charity_button').each(function(el) {
                    el.hide();
                });
            }

            if (charityData.marketplace_id) {
                marketplaceEl.value = charityData.marketplace_id;
                self.charityMarketplaceChange.call(self, marketplaceEl, charityData);
            } else {
                self.hideSelectedMarketplaceOptions();
            }
        },

        removeCharityRow: function (el) {
            el.up('.charity-row').remove();

            if ($('charity_table_tbody').select('tr').length == 0) {
                $('charity_not_set_table').show();
                $('charity_table').hide();
            }

            $$('.add_charity_button').each(function(el){
                el.show();
            });
        },

        renderFixedPriceChangeRows: function (data) {
            var self = this;
            for (var i = 0; i < data.length; i++) {
                self.addFixedPriceChangeRow(data[i]);
            }

            this.priceChangeCalculationUpdate();
        },

        addFixedPriceChangeRow: function (priceChangeData) {
            var priceChangeContainer = $('fixed_price_change_container');

            priceChangeData = priceChangeData || {};
            this.priceChangeIndex++;

            var tpl = this.priceChangeTpl;
            tpl = tpl.replace(/%i%/g, this.priceChangeIndex);
            priceChangeContainer.insert(tpl);
            var modeElement = $('fixed_price_modifier_mode_' + this.priceChangeIndex),
                valueElement = $('fixed_price_modifier_value_' + this.priceChangeIndex),
                removeButtonElement = $('fixed_price_modifier_row_remove_button_' + this.priceChangeIndex);

            var handlerObj = new AttributeCreator('fixed_price_modifier_mode_' + this.priceChangeIndex);
            handlerObj.setSelectObj(modeElement);
            handlerObj.injectAddOption();

            if (priceChangeData.mode) {
                for (var i = 0; i < modeElement.options.length; i++) {
                    if (modeElement.options[i].value != priceChangeData.mode) {
                        continue;
                    }

                    if (modeElement.options[i].value < this.constAttribute) {
                        modeElement.selectedIndex = i;
                        valueElement.value = priceChangeData['value'];
                        break;
                    } else {
                        if (modeElement.options[i].getAttribute('attribute_code') == priceChangeData['attribute_code']) {
                            modeElement.selectedIndex = i;
                            valueElement.hide();
                            break;
                        }
                    }
                }

                this.priceChangeCalculationUpdate();
            }

            var selectOnChangeHandler = function () {
                this.priceChangeSelectUpdate(modeElement)
            }.bind(this);
            modeElement
                .observe('change', selectOnChangeHandler)
                .simulate('change');

            var inputOnKeyUpHandler = function () {
                this.priceChangeCalculationUpdate();
            }.bind(this);
            valueElement.observe('keyup', inputOnKeyUpHandler);

            var buttonOnClickHandler = function () {
                this.removeFixedPriceChangeRow(removeButtonElement);
            }.bind(this);
            removeButtonElement.observe('click', buttonOnClickHandler);
        },

        removeFixedPriceChangeRow: function (element) {
            element.up('.fixed-price-change-row').remove();
            this.priceChangeCalculationUpdate();
        },

        // ---------------------------------------

        charityMarketplaceChange: function(marketplaceEl, charityData) {
            var self = this,
                organizationEl = marketplaceEl.up('.charity-row').down('.charity-organization'),
                percentageEl = organizationEl.up('.charity-row').down('.charity-percentage');

            charityData = charityData || {};

            self.hideSelectedMarketplaceOptions();

            percentageEl.value = '';

            if (marketplaceEl.value == '') {
                organizationEl.value = '';
                organizationEl.simulate('change');
                organizationEl.disable().hide();

                return;
            }
            organizationEl.update().enable().show();

            var option = new Element('option', {
                class: 'empty',
                value: ''
            });
            organizationEl.insert({bottom: option});

            option = new Element('option', {
                class: 'searchNewCharity',
                value: ''
            });
            option.innerHTML = M2ePro.translator.translate('Search for Charity Organization');
            organizationEl.insert({bottom: option});

            if (charityData.organization_id && charityData.organization_custom == 0) {

                charityData.organization_custom = 1;

                self.charityDictionary[marketplaceEl.value].charities.each(function (charity) {
                    if (charityData.organization_id == charity.id) {
                        charityData.organization_custom = 0;
                    }
                });
            }

            if (charityData.organization_custom) {
                var customOptgroup = new Element('optgroup', {
                    label: 'Custom',
                    class: 'customCharity'
                }).insert({
                    bottom: new Element('option', {
                        value: charityData.organization_id,
                        class: 'newCharity'
                    }).update(charityData.organization_name)
                });

                organizationEl.insert(customOptgroup);
                organizationEl.up('.charity-row').select('input.organization_custom')[0].value = charityData.organization_custom;
            }

            if (self.charityDictionary[marketplaceEl.value].charities.length > 0) {
                var optgroup = new Element('optgroup', {
                    label: 'Featured',
                    class: 'featuredCharity'
                });

                self.charityDictionary[marketplaceEl.value].charities.each(function (charity) {
                    var option = new Element('option', {
                        value: charity.id
                    });

                    option.innerHTML = charity.name;
                    optgroup.insert(option);
                });
                organizationEl.insert(optgroup);
            }

            if (charityData.organization_id) {
                organizationEl.value = charityData.organization_id;
                self.charityOrganizationChange.call(self, organizationEl, charityData);
            }
        },

        charityOrganizationChange: function (organizationEl, charityData) {
            var self = this,
                percentageEl = organizationEl.up('.charity-row').down('.charity-percentage'),
                marketplaceEl = organizationEl.up('.charity-row').down('.charity-marketplace_id');

            if (organizationEl[organizationEl.selectedIndex].hasClassName('searchNewCharity')) {
                self.openPopUpCharity(organizationEl, marketplaceEl.value);

                if (typeof self.charitySelectedHistory != 'undefined') {
                    organizationEl.selectedIndex = self.charitySelectedHistory;
                }

                return;
            }

            var optgroup = organizationEl[organizationEl.selectedIndex].up('optgroup')

            if (optgroup && optgroup.hasClassName('customCharity')) {
                organizationEl.up('.charity-row').select('input.organization_custom')[0].value = 1;
            } else {
                organizationEl.up('.charity-row').select('input.organization_custom')[0].value = 0;
            }

            self.charitySelectedHistory = organizationEl.selectedIndex;

            organizationEl.up('.charity-row').select('input.organization_name')[0].value = organizationEl[organizationEl.selectedIndex].innerHTML;

            charityData = charityData || {};

            if (organizationEl.value == '') {
                percentageEl.value = '';
                percentageEl.simulate('change');
                percentageEl.disable().hide();

                return;
            }
            percentageEl.update().enable().show();

            var option = new Element('option', {
                class: 'empty',
                value: ''
            });
            percentageEl.insert({bottom: option});

            if (marketplaceEl.value == M2ePro.php.constant('\\Ess\\M2ePro\\Helper\\Component\\Ebay::MARKETPLACE_MOTORS')) {
                option = new Element('option', {
                    value: 1
                });
                option.innerHTML = '1%';
                percentageEl.insert({bottom: option});
                option = new Element('option', {
                    value: 5
                });
                option.innerHTML = '5%';
                percentageEl.insert({bottom: option});
            }

            for (var i = 2; i < 21; i++) {
                option = new Element('option', {
                    value: i*5
                });
                option.innerHTML = i*5+'%';
                percentageEl.insert({bottom: option});
            }

            if (charityData.percentage) {
                percentageEl.value = charityData.percentage;
            }
        },

        priceChangeSelectUpdate: function (element) {
            var valueElement = $('fixed_price_modifier_value_' + element.dataset.priceChangeIndex),
                attributeElement = $('fixed_price_modifier_attribute_' + element.dataset.priceChangeIndex);

            if (element.options[element.selectedIndex].value == this.constAttribute) {
                valueElement.hide();
                this.selectMagentoAttribute(element, attributeElement);
            } else {
                valueElement.show();
                attributeElement.value = '';
            }

            this.priceChangeCalculationUpdate();
        },

        priceChangeCalculationUpdate: function () {
            var select, input, selectedOption, currentValue, result = 100, operations = ['$100'];

            $$('#fixed_price_change_container > *').each(function (element) {
                select = element.select('select').first();
                input = element.select('input').first();

                if (select.selectedIndex == -1) {
                    return;
                }

                selectedOption = select.options[select.selectedIndex];
                if (selectedOption.value == this.constAttribute) {
                    result += 7.5;
                    operations.push('+ $7.5');
                    return;
                }

                currentValue = Number.parseFloat(input.value);
                if (isNaN(currentValue) || currentValue < 0) {
                    return;
                }

                switch (Number.parseInt(selectedOption.value)) {
                    case this.constAbsoluteIncrease:
                        if (!isNaN(input.value)) {
                            result += currentValue;
                            operations.push(`+ $${currentValue}`);
                        }
                        break;
                    case this.constAbsoluteDecrease:
                        if (!isNaN(input.value)) {
                            result -= currentValue;
                            operations.push(`- $${currentValue}`);
                        }
                        break;
                    case this.constPercentageIncrease:
                        if (!isNaN(input.value)) {
                            result *= 1 + currentValue / 100;
                            operations.push(`+ ${currentValue}%`);
                        }
                        break;
                    case this.constPercentageDecrease:
                        if (!isNaN(input.value)) {
                            result *= 1 - currentValue / 100;
                            operations.push(`- ${currentValue}%`);
                        }
                        break;
                }
            }.bind(this));

            const calculationExampleElement = $('fixed_price_calculation_example');
            if (operations.length <= 1) {
                calculationExampleElement.hide();
                return;
            }

            calculationExampleElement.show();
            calculationExampleElement.innerHTML = 'Ex. ' + operations.join(' ') + ' = '
                + this.formatPrice(Math.round(result * 100) / 100, '$');

            if (result <= 0) {
                calculationExampleElement.style.color = 'red';
            } else {
                calculationExampleElement.style.color = 'black';
            }
        },

        formatPrice: function (price, currency) {
            if (isNaN(price)) {
                return currency + 0;
            }

            if (price >= 0) {
                return currency + price;
            } else {
                return '-' + currency + -price;
            }
        },

        // ---------------------------------------

        hideSelectedMarketplaceOptions: function()
        {
            var charityTBody =  $('charity_table_tbody');

            charityTBody.select('select.charity-marketplace_id option').each(function(option){
                option.show();
            });

            charityTBody.select('select.charity-marketplace_id').each(function(select){
                charityTBody.select('select.charity-marketplace_id option[value="' + select.value + '"]').each(function(option){
                    option.hide();
                });

                select[select.selectedIndex].show();
            });
        },

        // ---------------------------------------

        openPopUpCharity: function (organizationEl, marketplaceId) {
            var self = this;

            new Ajax.Request(M2ePro.url.get('ebay_template_sellingFormat/getSearchCharityPopUpHtml'), {
                method: 'post',
                parameters: {
                    marketplace_id: marketplaceId
                },
                onSuccess: function (transport) {

                    var container = $('charitySearch_pop_up_content');

                    if (container) {
                        container.remove();
                    }

                    $('html-body').insert({
                        bottom: transport.responseText
                    });

                    self.charitySearchPopup = jQuery('#charitySearch_pop_up_content');

                    modal({
                        title: M2ePro.translator.translate('Search For Charities'),
                        type: 'slide',
                        buttons: []
                    }, self.charitySearchPopup);

                    self.charitySearchPopup.modal('openModal');

                    self.charitySearchPopup.organizationEl = organizationEl;

                    $('query').observe('keypress', function (event) {
                        event.keyCode == Event.KEY_RETURN && self.searchCharity();
                    });

                    $('searchCharity_reset').observe('click', function (event) {
                        $('query').value = '';
                        $('selectCharitySearch').selectedIndex = '';
                        $('searchCharity_grid').hide();
                        $('searchCharity_warning_block').hide();
                    })
                }
            });

        },

        searchCharity: function () {
            var query = $('query').value;
            var destination = $('selectCharitySearch').value;
            var marketplaceId = $('charitySearch_marketplace_id').value;

            if (query == '') {
                $('query').focus();
                this.alert(M2ePro.translator.translate('Please, enter the organization name or ID.'));
                return;
            }

            $('searchCharity_grid').hide();
            $('searchCharity_error_block').hide();
            $('searchCharity_warning_block').hide();

            new Ajax.Request(M2ePro.url.get('ebay_template_sellingFormat/searchCharity'), {
                method: 'post',
                parameters: {
                    query: query,
                    destination: destination,
                    marketplace_id: marketplaceId
                },
                onSuccess: function (transport) {
                    transport = transport.responseText.evalJSON();

                    if (transport.result == 'success') {
                        $('searchCharity_grid')
                            .update(transport.html)
                            .show();

                        if (transport.count) {
                            $('searchCharity_warning_block').show();
                        }
                    } else {
                        $('searchCharity_error_block').update(transport.html);
                        $('searchCharity_error_block').show();
                    }
                }
            })
        },

        selectNewCharity: function (id, name) {
            var self = this;

            self.confirm({
                actions: {
                    confirm: function () {
                        var customCharities = self.charitySearchPopup.organizationEl.select('option.newCharity');

                        if (customCharities.length > 0) {
                            customCharities[0].update(name);
                            customCharities[0].value = id;
                        } else {
                            var optgroups = self.charitySearchPopup.organizationEl.select('optgroup.customCharity');

                            if (optgroups.length > 0) {
                                optgroups[0].insert({
                                    bottom: new Element('option', {
                                        value: id,
                                        class: 'newCharity'
                                    }).update(name)
                                });
                            } else {
                                var optgroup = new Element('optgroup', {
                                    label: 'Custom',
                                    class: 'customCharity'
                                }).insert({
                                    bottom: new Element('option', {
                                        value: id,
                                        class: 'newCharity'
                                    }).update(name)
                                });

                                var featuresGroups = self.charitySearchPopup.organizationEl.select('optgroup.featuredCharity');
                                if (featuresGroups.length > 0) {
                                    featuresGroups[0].insert({
                                        before: optgroup
                                    });
                                } else {
                                    self.charitySearchPopup.organizationEl.insert(optgroup);
                                }
                            }
                        }

                        self.charitySearchPopup.organizationEl.value = id;
                        self.charitySearchPopup.organizationEl.up('.charity-row').select('input.organization_custom')[0].value = 1;
                        self.charitySearchPopup.organizationEl.simulate('change');
                        self.charitySearchPopup.modal('closeModal');
                    },
                    cancel: function () {
                        return false;
                    }
                }
            });
        }

        // ---------------------------------------
    });
});