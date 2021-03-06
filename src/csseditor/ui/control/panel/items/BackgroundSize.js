import UnitRange from "./element/UnitRange";
import UIElement, { EVENT } from "../../../../../util/UIElement";
import { CHANGE_IMAGE, CHANGE_EDITOR, CHANGE_SELECTION } from "../../../../types/event";
import { UNIT_PX, percentUnit, unitValue, isValueUnit, convertPercentUnit } from "../../../../../util/css/types";
import { CLICK } from "../../../../../util/Event";
import { defaultValue } from "../../../../../util/functions/func";
import { SELECTION_CURRENT_LAYER, SELECTION_CURRENT_IMAGE_ID, SELECTION_CURRENT_IMAGE } from "../../../../types/SelectionTypes";

export default class BackgroundSize extends UIElement {
    components () {
        return {
            UnitRange
        }
    }
    template () {
        return `
            <div class='property-item background show'>
                <div class='items'>
                    <div>
                        <label>size</label>
                        <div class='size-list' ref="$size">
                            <button type="button" value="contain" title="contain" ></button>
                            <button type="button" value="cover" title="cover"></button>
                            <button type="button" value="auto" title="auto"></button>
                        </div>
                    </div>
                    <div>
                        <label>x</label>
                        <UnitRange 
                            ref="$x" 
                            min="-100" max="1000" step="1" value="0" unit="${UNIT_PX}"
                            maxValueFunction="getMaxX"
                            updateFunction="updateX"
                        />
                    </div>
                    <div>
                        <label>y</label>
                        <UnitRange 
                            ref="$y" 
                            min="-100" max="1000" step="1" value="0" unit="${UNIT_PX}"
                            maxValueFunction="getMaxY"
                            updateFunction="updateY"
                        />
                    </div>
                    <div>
                        <label>width</label>
                        <UnitRange 
                            ref="$width" 
                            min="0" max="1000" step="1" value="0" unit="${UNIT_PX}"
                            maxValueFunction="getMaxWidth"
                            updateFunction="updateWidth"
                        />
                    </div>
                    <div>
                        <label>height</label>
                        <UnitRange 
                            ref="$height" 
                            min="0" max="1000" step="1" value="0" unit="${UNIT_PX}"
                            maxValueFunction="getMaxHeight"
                            updateFunction="updateHeight"
                        />
                    </div>                    
                    <div>
                        <label>repeat</label>
                        <div class='flex repeat-list' ref="$repeat">
                            <button type="button" value='no-repeat' title="no-repeat">
                                <span></span>
                            </button>                        
                            <button type="button" value='repeat' title="repeat">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            <button type="button" value='repeat-x' title="repeat-x">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            <button type="button" value='repeat-y' title="repeat-y">
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                            <button type="button" value='space' title="space">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>                                
                            </button>
                            <button type="button" value='round' title="round">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>                                                                
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
    }

    updateWidth (backgroundSizeWidth) {
        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            this.commit(CHANGE_IMAGE, {id, backgroundSizeWidth})
        })
    }

    updateHeight (backgroundSizeHeight) {
        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            this.commit(CHANGE_IMAGE, {id, backgroundSizeHeight})
        })
    }

    updateX (backgroundPositionX) {
        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            this.commit(CHANGE_IMAGE, {id, backgroundPositionX})
        })
    }    

    updateY (backgroundPositionY) {
        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            this.commit(CHANGE_IMAGE, {id, backgroundPositionY})
        })
    }        

    getMaxHeight () {
        var layer = this.read(SELECTION_CURRENT_LAYER);

        if (!layer) return 0;

        return unitValue(layer.height)
    }

    getMaxY () {
        var layer = this.read(SELECTION_CURRENT_LAYER);

        if (!layer) return 0;

        return unitValue(layer.height) * 2; 
    }

    getMaxWidth () {
        var layer = this.read(SELECTION_CURRENT_LAYER);

        if (!layer) return 0;

        return unitValue(layer.width)
    }

    getMaxX () {
        var layer = this.read(SELECTION_CURRENT_LAYER);

        if (!layer) return 0;

        return unitValue(layer.width) * 2; 
    }    

    [CLICK('$size button')] (e) {
        
        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            var newValue = { id, backgroundSize: e.$delegateTarget.val()}
            this.selectBackgroundSize(newValue.backgroundSize);
            this.commit(CHANGE_IMAGE, newValue);
        })
    }    

    selectBackgroundSize(value = 'auto') {
        var selectedItem = this.refs.$size.$('.selected');
        if (selectedItem) selectedItem.removeClass('selected');

        if (!['contain', 'cover', 'auto'].includes(value)) {
            value = 'auto'; 
        }

        var item = this.refs.$size.$(`[value=${value}]`);

        if (item) {
            item.addClass('selected');
        }
    }

    selectBackgroundRepeat(value) {
        var selectedItem = this.refs.$repeat.$('.selected');
        if (selectedItem) selectedItem.removeClass('selected');

        var item = this.refs.$repeat.$(`[value=${value}]`);

        if (item) {
            item.addClass('selected');
        }
    }

    [CLICK('$repeat button')] (e) {
        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            var newValue = {id, backgroundRepeat: e.$delegateTarget.val()}
            this.selectBackgroundRepeat(newValue.backgroundRepeat);
            this.commit(CHANGE_IMAGE, newValue);
        })
    }

    [EVENT(
        CHANGE_IMAGE,
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] () {
        this.refresh()
    }

    refresh() {

        var isShow = this.isShow()

        this.$el.toggle(isShow)

        if (isShow) {
            this.read(SELECTION_CURRENT_IMAGE, (image) => {
                this.children.$width.refresh(image.backgroundSizeWidth);
                this.children.$height.refresh(image.backgroundSizeHeight);

                var x = convertPercentUnit( defaultValue(image.backgroundPositionX, percentUnit(0)) )
                var y = convertPercentUnit( defaultValue(image.backgroundPositionY, percentUnit(0)) )
                
                this.children.$x.refresh(x);
                this.children.$y.refresh(y);
                this.selectBackgroundSize(image.backgroundSize);
                this.selectBackgroundRepeat(image.backgroundRepeat);
            })   
        }

    }

    isShow () {

        return true; 
    }

}