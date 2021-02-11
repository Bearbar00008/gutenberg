/**
 * Internal dependencies
 */
import { createComponent } from '../utils';
import useText from './hook';

export default createComponent( {
	as: 'span',
	useHook: useText,
	name: 'Text',
} );
