import BasePropertyItem from "./BasePropertyItem";
import { 
    CHANGE_EDITOR, 
    CHANGE_LAYER,
    CHANGE_SELECTION,
    CHANGE_LAYER_BACKGROUND_COLOR,
    CHANGE_LAYER_CLIPPATH,
    CHANGE_LAYER_FILTER,
    CHANGE_LAYER_RADIUS,
    CHANGE_LAYER_ROTATE,
    CHANGE_LAYER_OPACITY,
    CHANGE_LAYER_TRANSFORM,
    CHANGE_LAYER_TRANSFORM_3D,
    CHANGE_BOXSHADOW,
    CHANGE_TEXTSHADOW,
    CHANGE_LAYER_SIZE,
    CHANGE_LAYER_POSITION,
    CHANGE_LAYER_MOVE,
    SELECT_TAB_LAYER,
    CHANGE_LAYER_BACKDROP_FILTER,
    CHANGE_LAYER_CLIPPATH_POLYGON,
    CHANGE_LAYER_BORDER
} from "../../../../types/event";
import { EVENT } from "../../../../../util/UIElement";
import { convertMatches, reverseMatches } from "../../../../../util/functions/parser";
import { LOAD } from "../../../../../util/Event";
import { SELECTION_CURRENT_LAYER } from "../../../../types/SelectionTypes";
import { LAYER_TOEXPORT } from "../../../../types/LayerTypes";
import { EMPTY_STRING } from "../../../../../util/css/types";

export default class LayerCode extends BasePropertyItem {
    template () {
        return `
            <div class='property-item layer-code show'>
                <div class='items'><div class="key-value-view" ref="$keys"></div></div>
            </div>
        `
    }

    [LOAD('$keys')] () {
        var layer = this.read(SELECTION_CURRENT_LAYER);

        if (!layer) return EMPTY_STRING; 

        return this.read(LAYER_TOEXPORT, layer, true).split(';').map(it => {
            var [key, value] = it.split(':');

            if (key == 'background-image' || key == 'box-shadow' || key == 'text-shadow') {
                var ret = convertMatches(value) ;

                var str = ret.str.split(',').join(',\n  ')

                str = str.replace(/\(/g, '(\n')
                str = str.replace(/\)/g, '\n)')

                value = reverseMatches(str, ret.matches)
            }            

            var isShort = EMPTY_STRING;

            if (value.length < 20) {
                isShort = 'short';
            }

            return `
                <div class="key-value-item ${isShort}">
                    <div class="key">${key}:</div>
                    <pre class="value">${value};</pre>
                </div>
            `;
        })
    }

    [EVENT(
        CHANGE_LAYER,
        CHANGE_LAYER_SIZE,
        CHANGE_LAYER_POSITION,
        CHANGE_LAYER_MOVE,
        CHANGE_LAYER_BACKGROUND_COLOR,
        CHANGE_LAYER_BORDER,
        CHANGE_LAYER_CLIPPATH,
        CHANGE_LAYER_CLIPPATH_POLYGON,
        CHANGE_LAYER_FILTER,
        CHANGE_LAYER_BACKDROP_FILTER,
        CHANGE_LAYER_RADIUS,
        CHANGE_LAYER_ROTATE,
        CHANGE_LAYER_OPACITY,
        CHANGE_LAYER_TRANSFORM,
        CHANGE_LAYER_TRANSFORM_3D,
        CHANGE_BOXSHADOW,
        CHANGE_TEXTSHADOW,
        CHANGE_EDITOR,
        CHANGE_SELECTION,
        SELECT_TAB_LAYER
    )] () { this.refresh() }    

    refresh() {

        if (this.config('tool.tabs.layer.selectedId') === 'css') {
            this.load();
        }

    }
    
}