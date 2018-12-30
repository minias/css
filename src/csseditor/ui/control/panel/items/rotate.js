import BasePropertyItem from "./BasePropertyItem";
import { EVENT_CHANGE_LAYER_TRANSFORM, CHANGE_LAYER_TRANSFORM, EVENT_CHANGE_EDITOR, EVENT_CHANGE_LAYER, EVENT_CHANGE_SELECTION, EVENT_CHANGE_LAYER_ROTATE } from "../../../../types/event";
import { INPUT } from "../../../../../util/Event";

export default class Rotate extends BasePropertyItem {
    template () {
        return `
            <div class='property-item rotate show'>
                <div class='items'>            
                    <div>
                        <label>Rotate</label>
                        <div>
                            <input type='range' ref="$rotateRange" min="-360" max="360" step="0.1">
                            <input type='number' ref="$rotate" min="-360" max="360" step="0.1"> <span>°</span>
                        </div>
                    </div>                                                                           
                </div>
            </div>
        `
    }

    [EVENT_CHANGE_LAYER] () { this.refresh(); }
    [EVENT_CHANGE_LAYER_ROTATE] () { this.refresh(); }
    [EVENT_CHANGE_EDITOR] () { this.refresh() }
    [EVENT_CHANGE_SELECTION] () { this.refresh() }    

    refresh() {
        this.read('selection/current/layer', (item) => {
            this.refs.$rotateRange.val(item.rotate || "0")
            this.refs.$rotate.val(item.rotate || "0")
        })
        
    }

    updateTransform (type) {
        this.read('selection/current/layer/id', (id) => {

            if (type == 'rotate') {
                this.commit(CHANGE_LAYER_TRANSFORM, {id, rotate: this.refs.$rotate.val()})
                this.refs.$rotateRange.val(this.refs.$rotate.val())
            } else if (type == 'range') {
                this.commit(CHANGE_LAYER_TRANSFORM, {id, rotate: this.refs.$rotateRange.val()})
                this.refs.$rotate.val(this.refs.$rotateRange.val())
            }
            
        })
    }

    [INPUT('$rotateRange')] () { this.updateTransform('range'); }
    [INPUT('$rotate')] () { this.updateTransform('rotate'); }
    
}