/**
 * External dependencies
 */
import classnames from 'classnames';
import mergeRefs from 'react-merge-refs';

/**
 * WordPress dependencies
 */
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import {
	InnerBlocks,
	__experimentalUseInnerBlocksProps as useInnerBlocksProps,
	InspectorControls,
	JustifyToolbar,
	BlockControls,
	useBlockProps,
} from '@wordpress/block-editor';
import { useDispatch, withSelect, withDispatch } from '@wordpress/data';
import { PanelBody, ToggleControl, ToolbarGroup } from '@wordpress/components';
import { compose } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import useBlockNavigator from './use-block-navigator';
import useAutohide from './use-autohide';
import useMaxHeight from './use-max-height';
import NavigationPlaceholder from './placeholder';
import PlaceholderPreview from './placeholder-preview';

function Navigation( {
	selectedBlockHasDescendants,
	attributes,
	setAttributes,
	clientId,
	hasExistingNavItems,
	innerBlocks,
	isImmediateParentOfSelectedBlock,
	isSelected,
	updateInnerBlocks,
	className,
	hasSubmenuIndicatorSetting = true,
	hasItemJustificationControls = attributes.orientation === 'horizontal',
	hasListViewModal = true,
} ) {
	const [ isPlaceholderShown, setIsPlaceholderShown ] = useState(
		! hasExistingNavItems
	);

	const navElement = useRef( null );
	const navItemsElement = useRef( null );

	const { selectBlock } = useDispatch( 'core/block-editor' );

	const containerHeight = useMaxHeight( navItemsElement );
	const { isWrapping } = useAutohide(
		clientId,
		innerBlocks,
		navItemsElement
	);

	const blockProps = useBlockProps( {
		className: classnames( className, {
			[ `items-justified-${ attributes.itemsJustification }` ]: attributes.itemsJustification,
			'is-vertical': attributes.orientation === 'vertical',
			wrapping: isWrapping,
		} ),
		style: {
			height: containerHeight || 'auto',
		},
	} );

	const { navigatorToolbarButton, navigatorModal } = useBlockNavigator(
		clientId
	);

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'wp-block-navigation__container',
		},
		{
			allowedBlocks: [
				'core/navigation-link',
				'core/search',
				'core/social-links',
				'core/page-list',
			],
			orientation: attributes.orientation || 'horizontal',
			renderAppender:
				( isImmediateParentOfSelectedBlock &&
					! selectedBlockHasDescendants ) ||
				isSelected
					? InnerBlocks.DefaultAppender
					: false,
			__experimentalAppenderTagName: 'li',
			__experimentalCaptureToolbars: true,
			// Template lock set to false here so that the Nav
			// Block on the experimental menus screen does not
			// inherit templateLock={ 'all' }.
			templateLock: false,
			__experimentalLayout: {
				type: 'default',
				alignments: [],
			},
			placeholder: <PlaceholderPreview />,
		}
	);

	const mergedNavRefs = useCallback(
		mergeRefs( [ blockProps.ref, navElement ] ),
		[ blockProps.ref, navElement ]
	);
	const mergedInnerBlocksRefs = useCallback(
		mergeRefs( [ innerBlocksProps.ref, navItemsElement ] ),
		[ innerBlocksProps.ref, navItemsElement ]
	);

	if ( isPlaceholderShown ) {
		return (
			<div { ...blockProps }>
				<NavigationPlaceholder
					onCreate={ ( blocks, selectNavigationBlock ) => {
						setIsPlaceholderShown( false );
						updateInnerBlocks( blocks );
						if ( selectNavigationBlock ) {
							selectBlock( clientId );
						}
					} }
				/>
			</div>
		);
	}

	function handleItemsAlignment( align ) {
		return () => {
			const itemsJustification =
				attributes.itemsJustification === align ? undefined : align;
			setAttributes( {
				itemsJustification,
			} );
		};
	}

	return (
		<>
			<BlockControls>
				{ hasItemJustificationControls && (
					<JustifyToolbar
						value={ attributes.itemsJustification }
						onChange={ handleItemsAlignment }
						popoverProps={ {
							position: 'bottom right',
							isAlternate: true,
						} }
					/>
				) }
				{ hasListViewModal && (
					<ToolbarGroup>{ navigatorToolbarButton }</ToolbarGroup>
				) }
			</BlockControls>
			{ hasListViewModal && navigatorModal }
			<InspectorControls>
				{ hasSubmenuIndicatorSetting && (
					<PanelBody title={ __( 'Display settings' ) }>
						<ToggleControl
							checked={ attributes.showSubmenuIcon }
							onChange={ ( value ) => {
								setAttributes( {
									showSubmenuIcon: value,
								} );
							} }
							label={ __( 'Show submenu indicator icons' ) }
						/>
					</PanelBody>
				) }
			</InspectorControls>
			<nav { ...blockProps } ref={ mergedNavRefs }>
				<input
					className="nav-toggle"
					name="nav-toggle"
					type="checkbox"
				/>
				<ul { ...innerBlocksProps } ref={ mergedInnerBlocksRefs } />
				<label htmlFor="nav-toggle" className="nav-button">
					More
				</label>
			</nav>
		</>
	);
}

export default compose( [
	withSelect( ( select, { clientId } ) => {
		const innerBlocks = select( 'core/block-editor' ).getBlocks( clientId );
		const {
			getClientIdsOfDescendants,
			hasSelectedInnerBlock,
			getSelectedBlockClientId,
		} = select( 'core/block-editor' );
		const isImmediateParentOfSelectedBlock = hasSelectedInnerBlock(
			clientId,
			false
		);
		const selectedBlockId = getSelectedBlockClientId();
		const selectedBlockHasDescendants = !! getClientIdsOfDescendants( [
			selectedBlockId,
		] )?.length;
		return {
			innerBlocks,
			isImmediateParentOfSelectedBlock,
			selectedBlockHasDescendants,
			hasExistingNavItems: !! innerBlocks.length,
		};
	} ),
	withDispatch( ( dispatch, { clientId } ) => {
		return {
			updateInnerBlocks( blocks ) {
				if ( blocks?.length === 0 ) {
					return false;
				}
				dispatch( 'core/block-editor' ).replaceInnerBlocks(
					clientId,
					blocks,
					true
				);
			},
		};
	} ),
] )( Navigation );
