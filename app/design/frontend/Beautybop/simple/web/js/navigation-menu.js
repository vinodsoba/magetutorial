define(["jquery","matchMedia","mage/template","mage/dropdowns","mage/terms"],function(s,e,a){"use strict";return s.widget("mage.navigationMenu",{options:{itemsContainer:"> ul",topLevel:"li.level0",topLevelSubmenu:"> .submenu",topLevelHoverClass:"hover",expandedTopLevel:".more",hoverInTimeout:300,hoverOutTimeout:500,submenuAnimationSpeed:200,collapsable:!0,collapsableDropdownTemplate:'<script type="text/x-magento-template"><li class="level0 level-top more parent"><div class="submenu"><ul><%= elems %></ul></div></li><\/script>'},_create:function(){this.itemsContainer=s(this.options.itemsContainer,this.element),this.topLevel=s(this.options.topLevel,this.element),this.topLevelSubmenu=s(this.options.topLevelSubmenu,this.topLevel),this._bind()},_init:function(){this.options.collapsable&&setTimeout(s.proxy(function(){this._checkToCollapseOrExpand()},this),100)},_bind:function(){this._on({"mouseenter > ul > li.level0":function(e){this.entered||(this.timeoutId&&clearTimeout(this.timeoutId),this.timeoutId=setTimeout(s.proxy(function(){this._openSubmenu(e)},this),this.options.hoverInTimeout),this.entered=!0)},"mouseleave > ul > li.level0":function(e){this.entered=null,this.timeoutId&&clearTimeout(this.timeoutId),this.timeoutId=setTimeout(s.proxy(function(){this._closeSubmenu(e.currentTarget)},this),this.options.hoverOutTimeout)},click:function(e){e.stopPropagation()}}),s(document).on("click.hideMenu",s.proxy(function(){this.topLevel.filter(function(){return s(this).data("opened")})&&this._closeSubmenu(null,!1)},this)),s(window).on("resize",s.proxy(function(){this.timeoutOnResize&&clearTimeout(this.timeoutOnResize),this.timeoutOnResize=setTimeout(s.proxy(function(){this.options.collapsable&&(s(this.options.expandedTopLevel,this.element).length&&this._expandMenu(),this._checkToCollapseOrExpand())},this),300)},this))},_openSubmenu:function(e){var t=e.currentTarget;s(t).data("opened")?s(e.target).closest(this.options.topLevel)&&s(e.target).addClass(this.options.topLevelHoverClass).siblings(this.options.topLevel).removeClass(this.options.topLevelHoverClass):(this._closeSubmenu(t,!0,!0),s(this.options.topLevelSubmenu,t).slideDown(this.options.submenuAnimationSpeed,s.proxy(function(){s(t).addClass(this.options.topLevelHoverClass),s(t).data("opened",!0)},this)))},_closeSubmenu:function(e,t,i){var n=s(this.options.topLevel,this.element),o=s(this.options.topLevelSubmenu,e||null);s(this.options.topLevelSubmenu,n).filter(function(){return!t||s(this).not(o)}).slideUp(i?0:this.options.submenuAnimationSpeed),n.removeClass(this.options.topLevelHoverClass).data("opened",!1)},_checkToCollapseOrExpand:function(){var i,n,o;s("html").hasClass("lt-640")||s("html").hasClass("w-640")||(i=this.itemsContainer.width(),o=n=0,s.each(s(this.options.topLevel,this.element),function(e,t){n+=s(t).outerWidth(!0),i<n&&!o&&(o=e-2)}),this[o?"_collapseMenu":"_expandMenu"](o))},_collapseMenu:function(t){this.elemsToCollapse=this.topLevel.filter(function(e){return t<e}),this.elemsToCollapseClone=s("<div></div>").append(this.elemsToCollapse.clone()).html(),this.collapsableDropdown=s(a(this.options.collapsableDropdownTemplate,{elems:this.elemsToCollapseClone})),this.itemsContainer.append(this.collapsableDropdown),this.elemsToCollapse.detach()},_expandMenu:function(){this.elemsToCollapse&&this.elemsToCollapse.appendTo(this.itemsContainer),this.collapsableDropdown&&this.collapsableDropdown.remove()},_destroy:function(){this._expandMenu()}}),s.widget("mage.navigationMenu",s.mage.navigationMenu,{options:{parentLevel:"> ul > li.level0",submenuAnimationSpeed:150,submenuContiniumEffect:!1},_init:function(){this._super(),this._applySubmenuStyles()},_applySubmenuStyles:function(){s(this.options.topLevelSubmenu,s(this.options.topLevel,this.element)).removeAttr("style"),s(this.options.topLevelSubmenu,s(this.options.parentLevel,this.element)).css({display:"block",height:0,overflow:"hidden"})},_openSubmenu:function(e){var t=e.currentTarget,i=s(this.options.topLevelSubmenu,t),n=s(this.options.topLevel,this.element).filter(function(){return s(this).data("opened")});i.length?(this.heightToAnimate=s(this.options.itemsContainer,i).outerHeight(!0),n.length?this._closeSubmenu(t,!0,this.heightToAnimate,s.proxy(function(){i.css({height:"auto"}),s(t).addClass(this.options.topLevelHoverClass)},this),e):i.animate({height:this.heightToAnimate},this.options.submenuAnimationSpeed,s.proxy(function(){s(t).addClass(this.options.topLevelHoverClass)},this)),s(t).data("opened",!0)):this._closeSubmenu(t)},_closeSubmenu:function(e,t,i,n){var o=s(this.options.topLevel,this.itemsContainer);t?(t=o.filter(function(){return s(this).data("opened")}),s(this.options.topLevelSubmenu,t).animate({height:i},this.options.submenuAnimationSpeed,"linear",function(){s(this).css({height:0}),n&&n()}),t.data("opened",!1).removeClass(this.options.topLevelHoverClass)):(s(this.options.topLevelSubmenu,s(this.options.parentLevel,this.element)).animate({height:0}),o.data("opened",!1).removeClass(this.options.topLevelHoverClass))},_collapseMenu:function(){this._superApply(arguments),this._applySubmenuStyles()}}),s.widget("mage.navigationMenu",s.mage.navigationMenu,{options:{responsive:!1,origNavPlaceholder:".page-header",mainContainer:"body",pageWrapper:".page-wrapper",openedMenuClass:"opened",toggleActionPlaceholder:".block-search",itemWithSubmenu:"li.parent",titleWithSubmenu:"li.parent > a",submenu:"li.parent > .submenu",toggleActionTemplate:'<script type="text/x-magento-template"><span data-action="toggle-nav" class="action toggle nav">Toggle Nav</span><\/script>',submenuActionsTemplate:'<script type="text/x-magento-template"><li class="action all"><a href="<%= categoryURL %>"><span>All <%= category %></span></a></li><\/script>',navigationSectionsWrapperTemplate:'<script type="text/x-magento-template"><dl class="navigation-tabs" data-sections="tabs"></dl><\/script>',navigationItemWrapperTemplate:'<script type="text/x-magento-template"><dt class="item title <% if (active) { %>active<% } %>" data-section="title"><a class="switch" data-toggle="switch" href="#TODO"><%= title %></a></dt><dd class="item content <% if (active) { %>active<%}%>" data-section="content"></dd><\/script>'},_init:function(){this._super(),this.mainContainer=s(this.options.mainContainer),this.pageWrapper=s(this.options.pageWrapper),this.toggleAction=s(a(this.options.toggleActionTemplate,{})),this.options.responsive&&e({media:"(min-width: 768px)",entry:s.proxy(function(){this._toggleDesktopMode()},this),exit:s.proxy(function(){this._toggleMobileMode()},this)})},_bind:function(){this._super(),this._bindDocumentEvents()},_bindDocumentEvents:function(){this.eventsBound||(s(document).on("click.toggleMenu",".action.toggle.nav",s.proxy(function(e){s(this.element).data("opened")?this._hideMenu():this._showMenu(),e.stopPropagation(),this.mobileNav.scrollTop(0),this._fixedBackLink()},this)).on("click.hideMenu",this.options.pageWrapper,s.proxy(function(){s(this.element).data("opened")&&(this._hideMenu(),this.mobileNav.scrollTop(0),this._fixedBackLink())},this)).on("click.showSubmenu",this.options.titleWithSubmenu,s.proxy(function(e){this._showSubmenu(e),e.preventDefault(),this.mobileNav.scrollTop(0),this._fixedBackLink()},this)).on("click.hideSubmenu",".action.back",s.proxy(function(e){this._hideSubmenu(e),this.mobileNav.scrollTop(0),this._fixedBackLink()},this)),this.eventsBound=!0)},_showMenu:function(){s(this.element).data("opened",!0),this.mainContainer.add("html").addClass(this.options.openedMenuClass)},_hideMenu:function(){s(this.element).data("opened",!1),this.mainContainer.add("html").removeClass(this.options.openedMenuClass)},_showSubmenu:function(e){s(e.currentTarget).addClass("action back"),s(e.currentTarget).siblings(".submenu").addClass("opened")},_hideSubmenu:function(e){var t=s(e.currentTarget).next(".submenu");s(e.currentTarget).removeClass("action back"),t.removeClass("opened")},_renderSubmenuActions:function(){s.each(s(this.options.itemWithSubmenu),s.proxy(function(e,t){var i=s(a(this.options.submenuActionsTemplate,{category:s("> a > span",t).text(),categoryURL:s("> a",t).attr("href")})),t=s("> .submenu",t);s("> ul",t).prepend(i)},this))},_toggleMobileMode:function(){this._expandMenu(),s(this.options.topLevelSubmenu,s(this.options.topLevel,this.element)).removeAttr("style"),this.toggleAction.insertBefore(this.options.toggleActionPlaceholder),this.mobileNav=s(this.element).detach().clone(),this.mainContainer.prepend(this.mobileNav),this.mobileNav.find("> ul").addClass("nav"),this._insertExtraItems(),this._wrapItemsInSections(),this.mobileNav.scroll(s.proxy(function(){this._fixedBackLink()},this)),this._renderSubmenuActions(),this._bindDocumentEvents()},_toggleDesktopMode:function(){this.mobileNav&&this.mobileNav.remove(),this.toggleAction.detach(),s(this.element).insertAfter(this.options.origNavPlaceholder),s(document).off("click.toggleMenu",".action.toggle.nav").off("click.hideMenu",this.options.pageWrapper).off("click.showSubmenu",this.options.titleWithSubmenu).off("click.hideSubmenu",".action.back"),this.eventsBound=!1,this._applySubmenuStyles()},_insertExtraItems:function(){var e,t;s(".header.panel .switcher").length&&(e=s(".header.panel .switcher").clone().addClass("settings"),this.mobileNav.prepend(e)),s(".footer .switcher").length&&(t=s(".footer .switcher").clone().addClass("settings"),this.mobileNav.prepend(t)),s(".header.panel .header.links li").length&&(t=s(".header.panel > .header.links").clone().addClass("account"),this.mobileNav.prepend(t))},_wrapItemsInSections:function(){var e,t=s("> .account",this.mobileNav),i=s("> .settings",this.mobileNav),n=s("> .nav",this.mobileNav),o=s(a(this.options.navigationSectionsWrapperTemplate,{}));this.mobileNav.append(o),n.length&&(e=s(a(this.options.navigationItemWrapperTemplate,{title:"Menu"})),o.append(e),e.eq(1).append(n)),t.length&&(e=s(a(this.options.navigationItemWrapperTemplate,{title:"Account"})),o.append(e),e.eq(1).append(t)),i.length&&(e=s(a(this.options.navigationItemWrapperTemplate,{title:"Settings"})),o.append(e),e.eq(1).append(i)),o.addClass("navigation-tabs-"+o.find('[data-section="title"]').length),o.terms()},_fixedBackLink:function(){var e,t,i=this.mobileNav.find(".submenu .action.back"),n=this.mobileNav.find(".submenu.opened > ul > .action.back").last();i.removeClass("fixed"),n.length&&(e=n.parent(),t=this.mobileNav.find(".nav").position().top,i=n.height(),t<=0?(n.addClass("fixed"),e.css({paddingTop:i})):(n.removeClass("fixed"),e.css({paddingTop:0})))}}),s.mage.navigationMenu});