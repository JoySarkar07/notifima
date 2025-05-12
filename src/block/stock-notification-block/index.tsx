import { registerBlockType, BlockEditProps } from "@wordpress/blocks";
import { useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { useState, useEffect } from "@wordpress/element";
import { useSelect } from "@wordpress/data";
import axios from "axios";

interface StockNotificationBlockAttributes {
    productId: number | null;
}

declare const stockNotificationBlock: {
    apiUrl: string;
    restUrl: string;
};

const EditBlock = ( {
    attributes,
    setAttributes,
}: BlockEditProps< StockNotificationBlockAttributes > ) => {
    const blockProps = useBlockProps();
    const [ formHtml, setFormHtml ] = useState< string >(
        // eslint-disable-next-line @wordpress/i18n-ellipsis
        __( "Loading form...", "notifima" )
    );

    const productId = useSelect( ( select: any ): number | null => {
        const blocks = select( "core/block-editor" ).getBlocks();
        const singleProductBlock = blocks.find(
            ( block: any ) => block.name === "woocommerce/single-product"
        );
        return singleProductBlock?.attributes?.productId ?? null;
    }, [] );

    useEffect( () => {
        if ( productId && productId !== attributes.productId ) {
            setAttributes( { productId } );
        }
    }, [ productId, attributes.productId, setAttributes ] );

    useEffect( () => {
        if ( productId ) {
            axios
                .get(
                    `${ stockNotificationBlock.apiUrl }/${ stockNotificationBlock.restUrl }/stock-notification-form?product_id=${ productId }`
                )
                .then( ( response ) => {
                    setFormHtml(
                        response.data.html ||
                            __( "Failed to load form.", "notifima" )
                    );
                } );
        } else {
            setFormHtml( __( "No product selected.", "notifima" ) );
        }
    }, [ productId ] );

    return (
        <div { ...blockProps }>
            <div dangerouslySetInnerHTML={ { __html: formHtml } } />
        </div>
    );
};

registerBlockType< StockNotificationBlockAttributes >(
    "notifima/stock-notification-block",
    {
        title: __( "Stock Notification Block", "notifima" ),
        description: __(
            "This block can be connected to WooCommerce Out-of-Stock and Backorder products to provide a stock notification form for users.",
            "notifima"
        ),
        category: "woocommerce",
        icon: "clipboard",
        supports: {
            html: false,
        },
        attributes: {
            productId: {
                type: "number",
                default: undefined,
            },
        },

        edit: EditBlock,

        save: () => {
            // Save function remains empty since rendering is handled by the PHP render callback
            return null;
        },
    }
);
