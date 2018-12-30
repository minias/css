
import BasePropertyItem from './BasePropertyItem';
import { EVENT_CHANGE_IMAGE, CHANGE_IMAGE,  EVENT_CHANGE_SELECTION } from '../../../../types/event';
import { MULTI_EVENT } from '../../../../../colorpicker/UIElement';
import { CHANGE } from '../../../../../util/Event';

export default class BackgroundBlend extends BasePropertyItem {

    template () { 
        return `
        <div class='property-item blend show'>
            <div class='items max-height'>         
                <div>
                    <label>Blend</label>
                    <div class='size-list' ref="$size">
                        <select ref="$blend">
                        ${this.read('blend/list').map(blend => {
                            return `<option value="${blend}">${blend}</option>`
                        }).join('')}
                        </select>
                    </div>
                </div>
            </div>
        </div>
        `
    }

    isShow () {
        return this.read('selection/is/image'); 
    }    

    refresh () {

        this.read('selection/current/image', (image) => {
            this.refs.$blend.val(image.backgroundBlendMode)
        })

    }

    [MULTI_EVENT(
        EVENT_CHANGE_IMAGE,
        EVENT_CHANGE_SELECTION
    )] () {
        this.refresh()
    }

    [CHANGE('$blend')] (e) {
        this.read('selection/current/image/id', (id) => {
            this.commit(CHANGE_IMAGE, {id, backgroundBlendMode: this.refs.$blend.val() }, true)
        });
    }

}