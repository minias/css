import {getXYInCircle, caculateAngle} from '../../../../util/functions/math'
import UIElement, { EVENT } from '../../../../util/UIElement';
import { CHANGE_EDITOR, CHANGE_IMAGE_ANGLE, CHANGE_SELECTION, CHANGE_TOOL, CHANGE_IMAGE_LINEAR_ANGLE } from '../../../types/event';
import { POINTERSTART, POINTEREND, POINTERMOVE, DEBOUNCE, IF, MOVE } from '../../../../util/Event';
import { SELECTION_IS_IMAGE, SELECTION_CURRENT_IMAGE, SELECTION_CURRENT_IMAGE_ID } from '../../../types/SelectionTypes';
import { IMAGE_TYPE_IS_LINEAR, IMAGE_TYPE_IS_CONIC, IMAGE_ANGLE } from '../../../../util/css/make';

export default class GradientAngle extends UIElement {

    template () {
        return `
            <div class='drag-angle-rect'>
                <div class="drag-angle" ref="$dragAngle">
                    <div ref="$angleText" class="angle-text"></div>
                    <div ref="$dragPointer" class="drag-pointer"></div>
                </div>
            </div>
        `
    }

    refresh () {

        if (this.isShow()) {
            this.$el.show();

            this.refreshUI()            
        } else {
            this.$el.hide();
        }
    }

    isShow () {
        if (!this.read(SELECTION_IS_IMAGE)) return false; 

        var item = this.read(SELECTION_CURRENT_IMAGE)

        if (!item) return false; 

        var isLinear = IMAGE_TYPE_IS_LINEAR(item.type)
        var isConic = IMAGE_TYPE_IS_CONIC(item.type)

        if (isLinear == false && isConic == false) {
            return false; 
        }

        return this.config('guide.angle')
    }

    getCurrentXY(isUpdate, angle, radius, centerX, centerY) {
        return isUpdate ? this.config('pos') : getXYInCircle(angle, radius, centerX, centerY)
    }

    getRectangle () {
        var width = this.refs.$dragAngle.width();  
        var height = this.refs.$dragAngle.height();  
        var radius = Math.floor(width/2 * 0.7); 
        var {left, top} = this.refs.$dragAngle.offset();
        var minX = left; 
        var minY = top; 
        var centerX = minX + width / 2;
        var centerY = minY + height / 2;

        return { minX, minY, width, height, radius,  centerX, centerY }
    }    

    getDefaultValue() {
        var image = this.read(SELECTION_CURRENT_IMAGE);
        if (!image) return 0 

        var angle = IMAGE_ANGLE(image.angle) 
        return angle - 90
    }

    refreshAngleText (angleText) {
        this.refs.$angleText.text(angleText + ' °') 
    }

    refreshUI (isUpdate) {
        var { minX, minY, radius,  centerX, centerY } = this.getRectangle()
        var { x , y } = this.getCurrentXY(isUpdate, this.getDefaultValue(), radius, centerX, centerY)

        var rx = x - centerX, ry = y - centerY, angle = caculateAngle(rx, ry);

        {
            var { x, y } = this.getCurrentXY(null, angle, radius, centerX, centerY);
        }

        // set drag pointer position 
        this.refs.$dragPointer.px('left', x - minX);
        this.refs.$dragPointer.px('top', y - minY);

        var lastAngle = Math.round(angle + 90) % 360;

        this.refreshAngleText (lastAngle)

        if (isUpdate) {

            this.setAngle (lastAngle)
        }

    }

    setAngle (angle) {

        this.read(SELECTION_CURRENT_IMAGE_ID, (id) => {
            this.commit(CHANGE_IMAGE_ANGLE, {id, angle});
        })

    }

    [EVENT(
        CHANGE_IMAGE_LINEAR_ANGLE,
        CHANGE_IMAGE_ANGLE,
        CHANGE_EDITOR,
        CHANGE_SELECTION
    )] () { this.refresh() }

    [EVENT(CHANGE_TOOL)] () {
        this.$el.toggle(this.isShow())
    }

    // Event Bindings 
    move () {
        this.refreshUI(true);
    }

    [POINTERSTART('$dragAngle') + MOVE()] (e) { }     

}