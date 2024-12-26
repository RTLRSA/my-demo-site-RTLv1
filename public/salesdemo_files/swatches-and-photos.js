/*!
 * Variations Plugin
 */
;(function($,window,document,undefined){function variation_calculator(variation_attributes,product_variations,all_set_callback,not_all_set_callback){this.recalc_needed=!0;this.all_set_callback=all_set_callback;this.not_all_set_callback=not_all_set_callback;this.variation_attributes=variation_attributes;this.variations_available=product_variations;this.variations_current={};this.variations_selected={};this.reset_current=function(){for(var attribute in this.variation_attributes){this.variations_current[attribute]={};for(var av=0;av<this.variation_attributes[attribute].length;av++){this.variations_current[attribute.toString()][this.variation_attributes[attribute][av].toString()]=0}}};this.update_current=function(){this.reset_current();for(var i=0;i<this.variations_available.length;i++){if(!this.variations_available[i].variation_is_active){continue}
var variation_attributes=this.variations_available[i].attributes;for(var attribute in variation_attributes){var maybe_available_attribute_value=variation_attributes[attribute];var selected_value=this.variations_selected[attribute];if(selected_value&&selected_value==maybe_available_attribute_value){this.variations_current[attribute][maybe_available_attribute_value]=1}else{var result=!0;for(var other_selected_attribute in this.variations_selected){if(other_selected_attribute==attribute){continue}
var other_selected_attribute_value=this.variations_selected[other_selected_attribute];var other_available_attribute_value=variation_attributes[other_selected_attribute];if(other_selected_attribute_value){if(other_available_attribute_value){if(other_selected_attribute_value!=other_available_attribute_value){result=!1}}}}
if(result){if(maybe_available_attribute_value===""){for(var av in this.variations_current[attribute]){this.variations_current[attribute][av]=1}}else{this.variations_current[attribute][maybe_available_attribute_value]=1}}}}}
this.recalc_needed=!1};this.get_current=function(){if(this.recalc_needed){this.update_current()}
return this.variations_current};this.reset_selected=function(){this.recalc_needed=!0;this.variations_selected={}}
this.set_selected=function(key,value){this.recalc_needed=!0;this.variations_selected[key]=value};this.get_selected=function(){return this.variations_selected}}
$.fn.wc_swatches_form=function(){var $form=this;var $product_id=parseInt($form.data('product_id'),10);var calculator=null;var $use_ajax=!1;var $swatches_xhr=null;var checked=!1;$form.on('bind_calculator',function(){var $product_variations=$form.data('product_variations');$use_ajax=$product_variations===!1;if($use_ajax){$form.block({message:null,overlayCSS:{background:'#fff',opacity:0.6}})}
var attribute_keys={};$form.find('.select-option.selected').each(function(index,el){var $this=$(this);var $option_wrapper=$this.closest('div.select').eq(0);var $label=$option_wrapper.parent().find('.swatch-label').eq(0);var $wc_select_box=$option_wrapper.find('select').first();var attr_val=$('<div/>').html($this.data('value')).text();attr_val=attr_val.replace(/'/g,'\\\'');attr_val=attr_val.replace(/"/g,'\\\"');if($label){$label.html($wc_select_box.children("[value='"+attr_val+"']").eq(0).text())}});$form.find('.variations select').each(function(index,el){var $current_attr_select=$(el);var current_attribute_name=$current_attr_select.data('attribute_name')||$current_attr_select.attr('name');attribute_keys[current_attribute_name]=[];var current_options='';current_options=$current_attr_select.find('option:gt(0)').get();if(current_options.length){for(var i=0;i<current_options.length;i++){var option=current_options[i];attribute_keys[current_attribute_name].push($(option).val())}}});if($use_ajax){if($swatches_xhr){$swatches_xhr.abort()}
var data={product_id:$product_id,action:'get_product_variations'};$swatches_xhr=$.ajax({url:wc_swatches_params.ajax_url,type:'POST',data:data,success:function(response){calculator=new variation_calculator(attribute_keys,response.data,null,null);$form.unblock()}})}else{calculator=new variation_calculator(attribute_keys,$product_variations,null,null)}
$form.trigger('woocommerce_variation_has_changed')});$form.on('click','.reset_variations',function(){$form.find('.swatch-label').html("&nbsp;");$form.find('.select-option').removeClass('selected');$form.find('.radio-option').prop('checked',!1);return!1}).on('reset_data',function(e){if(calculator==null){return}
var current_options=calculator.get_current();if(!checked){$form.find('div.select').each(function(index,element){var $wc_select_box=$(element).find('select').first();var attribute_name=$wc_select_box.data('attribute_name')||$wc_select_box.attr('name');var avaiable_options=current_options[attribute_name];$(element).find('div.select-option').each(function(index,option){if(!avaiable_options[$(option).data('value')]){$(option).removeClass('selected');$(option).addClass('disabled','disabled')}else{$(option).removeClass('disabled')}});$(element).find('input.radio-option').each(function(index,option){if(!avaiable_options[$(option).val()]){$(option).attr('disabled','disabled');$(option).parent().addClass('disabled','disabled')}else{$(option).removeAttr('disabled');$(option).parent().removeClass('disabled')}})});checked=!0}}).on('click','.select-option',function(e){e.preventDefault();var $this=$(this);var $option_wrapper=$this.closest('div.select').eq(0);var $label=$option_wrapper.parent().find('.swatch-label').eq(0);if($this.hasClass('disabled')){return!1}else if($this.hasClass('selected')){$this.removeClass('selected');var $wc_select_box=$option_wrapper.find('select').first();$wc_select_box.children('option:eq(0)').prop("selected","selected").change();if($label){$label.html("&nbsp;")}}else{$option_wrapper.find('.select-option').removeClass('selected');$this.addClass('selected');var wc_select_box_id=$option_wrapper.data('selectid');var $wc_select_box=$option_wrapper.find('select').first();var attr_val=$('<div/>').html($this.data('value')).text();attr_val=attr_val.replace(/'/g,'\\\'');attr_val=attr_val.replace(/"/g,'\\\"');$wc_select_box.trigger('focusin').children("[value='"+attr_val+"']").prop("selected","selected").change();if($label){$label.html($wc_select_box.children("[value='"+attr_val+"']").eq(0).text())}}}).on('change','.radio-option',function(e){var $this=$(this);var $option_wrapper=$this.closest('div.select').eq(0);var $wc_select_box=$option_wrapper.find('select').first();var attr_val=$('<div/>').html($this.val()).text();attr_val=attr_val.replace(/'/g,'\\\'');attr_val=attr_val.replace(/"/g,'\\\"');$wc_select_box.trigger('focusin').children("[value='"+attr_val+"']").prop("selected","selected").change()}).on('woocommerce_variation_has_changed',function(){if(calculator===null){return}
$form.find('.variations select').each(function(){var attribute_name=$(this).data('attribute_name')||$(this).attr('name');calculator.set_selected(attribute_name,$(this).val())});var current_options=calculator.get_current();$form.find('div.select').each(function(index,element){var $wc_select_box=$(element).find('select').first();var attribute_name=$wc_select_box.data('attribute_name')||$wc_select_box.attr('name');var avaiable_options=current_options[attribute_name];$(element).find('div.select-option').each(function(index,option){if(!avaiable_options[$(option).data('value')]){$(option).addClass('disabled','disabled')}else{$(option).removeClass('disabled')}});$(element).find('input.radio-option').each(function(index,option){if(!avaiable_options[$(option).val()]){$(option).attr('disabled','disabled');$(option).parent().addClass('disabled','disabled')}else{$(option).removeAttr('disabled');$(option).parent().removeClass('disabled')}})});if($use_ajax){$form.find('.wc-default-select').each(function(index,element){var $wc_select_box=$(element);var attribute_name=$wc_select_box.data('attribute_name')||$wc_select_box.attr('name');var avaiable_options=current_options[attribute_name];$wc_select_box.find('option:gt(0)').removeClass('attached');$wc_select_box.find('option:gt(0)').removeClass('enabled');$wc_select_box.find('option:gt(0)').removeAttr('disabled');$wc_select_box.find('option:gt(0)').each(function(optindex,option_element){if(!avaiable_options[$(option_element).val()]){$(option_element).addClass('disabled','disabled')}else{$(option_element).addClass('attached');$(option_element).addClass('enabled')}});$wc_select_box.find('option:gt(0):not(.enabled)').attr('disabled','disabled')})}})};var forms=[];$(document).on('wc_variation_form',function(e){var $form=$(e.target);forms.push($form);if(!$form.data('has_swatches_form')||$form.hasClass('summary_content')){if($form.find('.swatch-control').length){$form.data('has_swatches_form',!0);$form.wc_swatches_form();$form.trigger('bind_calculator');$form.on('reload_product_variations',function(){for(var i=0;i<forms.length;i++){forms[i].trigger('woocommerce_variation_has_changed');forms[i].trigger('bind_calculator');forms[i].trigger('woocommerce_variation_has_changed')}});$form.trigger('check_variations')}}})})(jQuery,window,document)