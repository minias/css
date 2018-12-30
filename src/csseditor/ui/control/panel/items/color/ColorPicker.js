
import ColorPicker from '../../../../../../colorpicker/index'
import UIElement, { MULTI_EVENT } from '../../../../../../colorpicker/UIElement';
import { 
    EVENT_CHANGE_COLOR_STEP, 
    CHANGE_COLOR_STEP, 
    CHANGE_IMAGE_COLOR,
    EVENT_CHANGE_IMAGE , 
    EVENT_CHANGE_EDITOR,
    EVENT_CHANGE_SELECTION
} from '../../../../../types/event';
import { isNotUndefined } from '../../../../../../util/functions/func';

export default class ColorPickerLayer extends UIElement {

    afterRender () {
        var defaultColor = 'red'
        this.colorPicker = ColorPicker.create({
            type: 'ring-tab',
            tabTitle: 'Step',
            position: 'inline',
            container: this.$el.el,
            color: defaultColor,
            onChange: (c) => {
                this.changeColor(c);
            }
        })    

        setTimeout(() => {
            this.colorPicker.dispatch('initColor', defaultColor)
        }, 100)
        
    }    

    template () { 
        return `<div class='colorpicker-layer'> </div>`
    }

    changeColor (color) {
        var item = this.read('selection/current')

        if (!item.length) return; 

        item = item[0];

        if (this.read('selection/is/image')) {
            
            if (this.read('image/type/isStatic', item.type)) {
                this.commit(CHANGE_IMAGE_COLOR, {id: item.id, color})
            } else if (this.read('image/type/isGradient',item.type)) {

                this.read('item/each/children', item.id, (step) => {
                    if (step.selected) {
                        this.commit(CHANGE_COLOR_STEP, {id: step.id, color})
                    }
                })
            }
        }

    }

    [EVENT_CHANGE_COLOR_STEP] (newValue) {
        if (isNotUndefined(newValue.color)) {
            this.colorPicker.initColorWithoutChangeEvent(this.read('tool/get', 'color'));
        }
    }

    '@changeColor' () {
        this.colorPicker.initColorWithoutChangeEvent(this.read('tool/get', 'color'));
    } 

    [MULTI_EVENT(
      EVENT_CHANGE_IMAGE,
      EVENT_CHANGE_EDITOR,
      EVENT_CHANGE_SELECTION
    )] () { this.refresh() }    

    refresh() {
        if (this.read('selection/is/image')) {
            this.read('selection/current/image', (image) => {
                if (this.read('image/type/isStatic', image.type)) {
                    this.colorPicker.initColorWithoutChangeEvent(image.color);
                } else if (this.read('image/type/isGradient', image.type)) {
                    
                }
            })
        }
    }

}