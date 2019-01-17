
import BasePropertyItem from './BasePropertyItem';
import { 
    CHANGE_TEXTSHADOW, 
    CHANGE_SELECTION, 
    CHANGE_EDITOR, 
    CHANGE_LAYER, 
    TEXT_FILL_COLOR
} from '../../../../types/event';
import { EVENT } from '../../../../../colorpicker/UIElement';
import { ITEM_TYPE_TEXTSHADOW } from '../../../../module/ItemTypes';
import { px, unitValue, pxUnit, EMPTY_STRING } from '../../../../../util/css/types';
import { CLICK, INPUT, LOAD } from '../../../../../util/Event';
import { ITEM_INITIALIZE, ITEM_ADD } from '../../../../module/ItemCreateTypes';
import { SELECTION_CURRENT_LAYER_ID, SELECTION_CURRENT_LAYER, SELECTION_CHECK, SELECTION_ONE } from '../../../../module/SelectionTypes';
import { HISTORY_PUSH } from '../../../../module/HistoryTypes';

export default class TextShadow extends BasePropertyItem {

    template () { 
        return `
        <div class='property-item text-shadow show'>
            <div class='title' ref="$title">
                Text Shadow 
                <span style="float:right;">
                    <button type="button" ref="$add">+</button>
                </span>
            </div>
            <div class='items'>         
                <div class="text-shadow-list" ref="$textShadowList"></div>
            </div>
        </div>
        `
    }

    makeField () {
        return `
        <div class='text-shadow-item label'>  
                <div class="color"></div>                     
                <div class="input">
                    <input class="x" type="text" value="X" />
                </div>                
                <div class="input">
                    <input class="y" type="text" value="Y" />
                </div>
                <div class="input">
                    <input class="blur" type="text" value="B" />
                </div>
                <button type="button">&times;</button>                                              
            </div>
    `
    }

    makeItemNodetextShadow (item) {

        var offsetX = unitValue(item.offsetX);
        var offsetY = unitValue(item.offsetY);
        var blurRadius = unitValue(item.blurRadius);
        var checked = this.read(SELECTION_CHECK, item.id) ? 'checked': EMPTY_STRING;

        return `
            <div class='text-shadow-item ${checked}' text-shadow-id="${item.id}">  
                <div class="color" style="background-color: ${item.color};"></div>                      
                <div class="input">
                    <input type="number" min="-100" max="100" data-type='offsetX' value="${offsetX}" />
                </div>                

                <div class="input">
                    <input type="number" min="-100" max="100" data-type='offsetY' value="${offsetY}" />
                </div>
                <div class="input">
                    <input type="number" min="0" max="100" data-type='blurRadius' value="${blurRadius}" />
                </div>
                <button type="button" class='delete-textshadow'>&times;</button>                                                                                                            
            </div>
        `
    }

    [LOAD('$textShadowList')] () {
        var item = this.read(SELECTION_CURRENT_LAYER)
        if (!item) { return EMPTY_STRING; }

        var results =  this.read('item/map/textshadow/children', item.id, (item) => {
            return this.makeItemNodetextShadow(item)
        })

        results.push(this.makeField());

        return results;
    }



    isShow () {
        return true; 
        // return this.read(SELECTION_IS_LAYER); 
    }    

    refresh () {

        var isShow = this.isShow();

        this.$el.toggle(isShow);

        if(isShow) {
            this.load()
        }
    }

    [EVENT(CHANGE_TEXTSHADOW)] (newValue) {
        this.refreshTextShadow(newValue);
    }

    refreshTextShadow(newValue) {
        var $el = this.refs.$textShadowList.$(`[text-shadow-id="${newValue.id}"] .color`);
        if ($el) {
            $el.css('background-color', newValue.color);
        }
    }
  
    [EVENT(
        CHANGE_LAYER,
        CHANGE_SELECTION,
        CHANGE_EDITOR
    )] () {
        if (this.isPropertyShow()) {
            this.refresh()
        }
    }

    [CLICK('$add')] (e) {
        this.read(SELECTION_CURRENT_LAYER_ID, (id) => {
            this.dispatch(ITEM_ADD, ITEM_TYPE_TEXTSHADOW, false, id)
            this.dispatch(HISTORY_PUSH, `Add text Shadow` );        
            this.refresh();
        }); 
    }

    [INPUT('$textShadowList input[type=number]')] (e) {
        var $el = e.$delegateTarget;
        var field = $el.attr('data-type');
        var id = $el.parent().parent().attr('text-shadow-id')

        this.commit(CHANGE_TEXTSHADOW, {id, [field]: pxUnit($el.int()) })
    }

    [CLICK('$textShadowList .delete-textshadow')] (e) {
        var $el = e.$delegateTarget;
        var id = $el.parent().attr('text-shadow-id')

        this.run(ITEM_INITIALIZE, id);
        this.emit(CHANGE_TEXTSHADOW)
        this.refresh();
    }

    [CLICK('$textShadowList .color')] (e) {
        var $el = e.$delegateTarget;
        var id = $el.parent().attr('text-shadow-id')

        this.dispatch(SELECTION_ONE, id);
        this.emit(TEXT_FILL_COLOR, id, CHANGE_TEXTSHADOW);
        this.refresh();
    }

}