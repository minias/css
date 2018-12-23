import BaseModule from "../../colorpicker/BaseModule";
import { parseParamNumber } from "../../util/filter/functions";
import Dom from "../../util/Dom";
import layerList from './layers/index';
import { ITEM_TYPE_BOXSHADOW, ITEM_TYPE_TEXTSHADOW, ITEM_TYPE_IMAGE } from "./ItemTypes";
import { percent } from "../../util/css/types";

export default class LayerManager extends BaseModule {
   
    '*/layer/list/sample' ($store, type = 'all') {
 
        var results = [] 

        results = layerList.map(it => Object.assign({}, it))

        return results;
    }

    '*/layer/toString' ($store, layer, withStyle = true, image = null) {

        var obj = $store.read('/layer/toCSS', layer, withStyle, image) || {};

        if (image) {
            delete obj['background-color'];
            delete obj['mix-blend-mode'];
            delete obj['filter'];
        }

        return $store.read('/css/toString', obj);
    }

    '*/layer/cache/toString' ($store, layer, opt = {}) {
        var obj = $store.read('/layer/cache/toCSS', layer) || {};
        obj.position = 'absolute';
        return {
            css: $store.read('/css/toString', obj),
            obj
        }
    }    

    '*/layer/toExport' ($store, layer, withStyle = true) {

        var obj = $store.read('/layer/toCSS', layer, withStyle, null, true) || {};
        obj.position = obj.position || 'absolute';

        return $store.read('/css/toString', obj);
    }    

    '*/layer/make/clip-path' ($store, layer) {
        return $store.read('/clip-path/toCSS', layer);
    }

    '*/layer/make/filter' ($store, layer) {       
        return $store.read('/filter/toCSS', layer);
    }

    '*/layer/make/backdrop' ($store, layer) {       
        return $store.read('/backdrop/toCSS', layer);
    }    

    '*/layer/toImageCSS' ($store, layer, isExport = false) {    
        var results = {}
        $store.read('/item/each/children', layer.id, (item)  => {
            var css = $store.read('/image/toCSS', item, isExport);

            Object.keys(css).forEach(key => {
                if (!results[key]) {
                    results[key] = [] 
                }

                results[key].push(css[key]);
            })
        })

        Object.keys(results).forEach(key => {
            if (Array.isArray(results[key])) {
                results[key] = results[key].join(', ')
            }
        })

        return results; 
    }


    '*/layer/cache/toImageCSS' ($store, images) {    
        var results = {}

        images.forEach(item => {
            var image = Object.assign({}, item.image, {colorsteps: item.colorsteps})
            var css = $store.read('/image/toCSS', image);

            Object.keys(css).forEach(key => {
                if (!results[key]) {
                    results[key] = [] 
                }

                results[key].push(css[key]);
            })
        })

        Object.keys(results).forEach(key => {
            if (Array.isArray(results[key])) {
                results[key] = results[key].join(', ')
            }
        })

        return results; 
    }    

    '*/layer/image/toImageCSS' ($store, image) {    
        return $store.read('/css/generate', $store.read('/image/toCSS', image));
    }    

    '*/layer/make/map' ($store, layer, itemType, isExport) {
        var results = {}
        $store.read(`/item/map/${itemType}/children`, layer.id, (item)  => {
            var css = $store.read(`/${itemType}/toCSS`, item, isExport);

            Object.keys(css).forEach(key => {
                if (!results[key]) {
                    results[key] = [] 
                }

                results[key].push(css[key]);
            })
        })

        Object.keys(results).forEach(key => {
            if (Array.isArray(results[key])) {
                results[key] = results[key].join(', ')
            }
        })

        return results;
    }

    '*/layer/make/box-shadow' ($store, layer, isExport) {
        return $store.read('/layer/make/map', layer, ITEM_TYPE_BOXSHADOW, isExport);
    }

    '*/layer/make/font' ($store, layer, isExport) {
        var results = {}

        if (layer.color) {
            results['color'] = layer.color;
        }

        if (layer.fontSize) {
            results['font-size'] = layer.fontSize;
        }

        if (layer.fontFamily) {
            results['font-family'] = layer.fontFamily;
        }

        if (layer.fontWeight) {
            results['font-weight'] = layer.fontWeight;
        }        

        if (typeof layer.lineHeight != 'undefined') {
            results['line-height']  = layer.lineHeight
        }

        results['word-wrap'] = layer.wordWrap || 'break-word';
        results['word-break'] = layer.wordBreak || 'break-word';

        if (layer.clipText) {
            results['color'] = 'transparent';
            results['background-clip'] = 'text';
            results['-webkit-background-clip'] = 'text';
        }

        return results;
    }

    '*/layer/make/image' ($store, layer, isExport) {
        return $store.read('/layer/make/map', layer, ITEM_TYPE_IMAGE, isExport);
    }    

    '*/layer/make/text-shadow' ($store, layer, isExport) {
        return $store.read('/layer/make/map', layer, ITEM_TYPE_TEXTSHADOW, isExport);
    }    

    '*/layer/make/transform' ($store, layer) {

        var results = [] 

        if (layer.rotate) {
            results.push(`rotate(${layer.rotate}deg)`)
        }

        if (layer.skewX) {
            results.push(`skewX(${layer.skewX}deg)`)
        }        

        if (layer.skewY) {
            results.push(`skewY(${layer.skewY}deg)`)
        }                

        if (layer.scale) {
            results.push(`scale(${layer.scale})`)
        }                        

        if (layer.translateX) {
            results.push(`translateX(${layer.translateX}px)`)
        }                                

        if (layer.translateY) {
            results.push(`translateY(${layer.translateY}px)`)
        }

        if (layer.translateZ) { 
            results.push(`translateZ(${layer.translateZ}px)`)
        }

        if (layer.rotate3dX || layer.rotate3dY || layer.rotate3dZ || layer.rotate3dA) {
            results.push(`rotate3d( ${layer.rotate3dX||0}, ${layer.rotate3dY||0}, ${layer.rotate3dZ||0}, ${layer.rotate3dA || 0}deg  )`);
        }

        if (layer.scale3dX || layer.scale3dY || layer.scale3dZ) {
            results.push(`scale3d( ${layer.scale3dX || 1}, ${layer.scale3dY || 1}, ${layer.scale3dZ || 1})`);
        }        

        if (layer.translate3dX || layer.translate3dY || layer.translate3dZ) {
            results.push(`translate3d( ${layer.translate3dX||0}px, ${layer.translate3dY||0}px, ${layer.translate3dZ||0}px)`);
        }                
s
        return {
            transform: (results.length ? results.join(' ') : 'none')
        }
    }

    '*/layer/toStringClipPath' ($store, layer) {
        
        if (['circle'].includes(layer.clipPathType)) return ''; 
        if (!layer.clipPathSvg) return ''; 

        let transform = '';

        if (layer.fitClipPathSize) {
            const widthScale = parseParamNumber(layer.width) / layer.clipPathSvgWidth;
            const heightScale = parseParamNumber(layer.height) / layer.clipPathSvgHeight;
    
            transform = `scale(${widthScale} ${heightScale})`    
        }

        var $div = new Dom ('div');
        var paths = $div.html(layer.clipPathSvg).$('svg').html();
        var svg = `<svg height="0" width="0"><defs><clipPath id="clippath-${layer.id}" ${transform ? `transform="${transform}"` : ""} >${paths}</clipPath></defs></svg>`

        return svg 
    }

    '*/layer/getClipPath' ($store, layer) {
        var items = $store.read('/item/filter/children', layer.id, function (image) {
            return image.isClipPath
        }).map(id => {
            return $store.items[id]
        })

        return items.length ? items[0] : null;
    }

    isFixedRadius (layer) {
        if (layer.fixedRadius) return [layer.borderRadius]; 

        var count = [
            layer.borderTopLeftRadius == layer.borderTopRightRadius,
            layer.borderTopRightRadius == layer.borderBottomRightRadius,
            layer.borderBottomRightRadius == layer.borderBottomLeftRadius,
            layer.borderTopLeftRadius == layer.borderBottomLeftRadius,
        ].filter(it => !it).length

        if (count == 0) {
            return [layer.borderTopLeftRadius]
        }

        return []
    }

    '*/layer/make/border-radius' ($store, layer) {
        var css = {};
        var isFixedRadius = this.isFixedRadius(layer);
        if (isFixedRadius.length) {
            css['border-radius'] = isFixedRadius[0]
        } else {
            css['border-top-left-radius'] = layer.borderTopLeftRadius;
            css['border-top-right-radius'] = layer.borderTopRightRadius;
            css['border-bottom-left-radius'] = layer.borderBottomLeftRadius;
            css['border-bottom-right-radius'] = layer.borderBottomRightRadius;
        }

        return css;
    }

    '*/layer/toCSS' ($store, layer = null, withStyle = true, image = null, isExport = false) {
        var css = {};

        if (withStyle) {
            css.left = layer.x 
            css.top = layer.y
            css.width = layer.width
            css.height = layer.height
            css['z-index'] = layer.index;
        }

        if (layer.backgroundColor) {
            css['background-color'] = layer.backgroundColor
        }         
        
        if (layer.mixBlendMode) {
            css['mix-blend-mode'] = layer.mixBlendMode || ""
        }


        if (layer.backgroundClip && !layer.clipText) {
            css['background-clip'] = layer.backgroundClip || ""
            css['-webkit-background-clip'] = layer.backgroundClip || ""            
        }        

        if (layer.opacity) {
            css['opacity'] = layer.opacity;
        }

        var results = Object.assign(css, 
            $store.read('/layer/make/border-radius', layer),
            $store.read('/layer/make/transform', layer),
            $store.read('/layer/make/clip-path', layer),
            $store.read('/layer/make/filter', layer),
            $store.read('/layer/make/backdrop', layer),            
            $store.read('/layer/make/font', layer),            
            $store.read('/layer/make/box-shadow', layer),
            $store.read('/layer/make/text-shadow', layer),
            (image) ? $store.read('/layer/image/toImageCSS', image) : $store.read('/layer/make/image', layer, isExport)
        )

        var realCSS = {}
        Object.keys(results).filter(key => {
            return !!results[key]
        }).forEach(key => {
            realCSS[key] = results[key]
        })

        return realCSS; 
    }


    '*/layer/cache/toCSS' ($store, item = null) {
        var layer = Object.assign({}, $store.read('/item/convert/style', item.layer), { images: item.images });
        var css = {
            left: layer.x,
            top: layer.y,
            width: layer.width, 
            height: layer.height
        }

        if (layer.backgroundColor) {
            css['background-color'] = layer.backgroundColor
        }         
        
        if (layer.mixBlendMode) {
            css['mix-blend-mode'] = layer.mixBlendMode
        }

        if (layer.backgroundClip && !layer.clipText) {
            css['background-clip'] = layer.backgroundClip || ""
            css['-webkit-background-clip'] = layer.backgroundClip || ""
        }                

        if (layer.opacity) {
            css['opacity'] = layer.opacity;
        }

        var results = Object.assign(css, 
            $store.read('/layer/make/border-radius', layer),
            $store.read('/layer/make/transform', layer),            
            $store.read('/layer/make/clip-path', layer),
            $store.read('/layer/make/filter', layer),
            $store.read('/layer/make/backdrop', layer),            
            $store.read('/layer/make/font', layer),
            $store.read('/layer/make/box-shadow', layer),
            $store.read('/layer/make/text-shadow', layer),
            $store.read('/layer/cache/toImageCSS', layer.images)
        )

        var realCSS = {}
        Object.keys(results).filter(key => {
            return !!results[key]
        }).forEach(key => {
            realCSS[key] = results[key]
        })

        return realCSS; 
    }

}