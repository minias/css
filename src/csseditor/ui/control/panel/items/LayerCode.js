import BasePropertyItem from "./BasePropertyItem";
import { 
    CHANGE_EDITOR, 
    CHANGE_LAYER,
    CHANGE_SELECTION,
    CHANGE_BOXSHADOW,
    CHANGE_TEXTSHADOW,
    SELECT_TAB_LAYER
} from "../../../../types/event";
import { EVENT } from "../../../../../util/UIElement";
import { convertMatches, reverseMatches } from "../../../../../util/functions/parser";
import { LOAD } from "../../../../../util/Event";
import { EMPTY_STRING } from "../../../../../util/css/types";
import { editor } from "../../../../../editor/editor";
import { keyMap } from "../../../../../util/functions/func";

export default class LayerCode extends BasePropertyItem {
    template () {
        return `
            <div class='property-item layer-code show'>
                <div class='items'>
                    <div class="key-value-view" ref="$keys"></div>
                </div>
            </div>
        `
    }

    [LOAD('$keys')] () {
        var layer = editor.selection.layer;

        if (!layer) return EMPTY_STRING; 

        return keyMap(layer.toCSS(), (key, value) => {
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
        CHANGE_BOXSHADOW,
        CHANGE_TEXTSHADOW,
        CHANGE_EDITOR,
        CHANGE_SELECTION,
        SELECT_TAB_LAYER
    )] () { this.refresh() }    

    refresh() {

        if (editor.config.get('tool.tabs.layer.selectedId') === 'css') {
            this.load();
        }

    }
    
}