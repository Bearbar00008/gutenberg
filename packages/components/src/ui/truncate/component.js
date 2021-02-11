/**
 * Internal dependencies
 */
import { createComponent } from '../utils';
import useTruncate from './hook';

export default createComponent( {
	as: 'span',
	useHook: useTruncate,
	name: 'Truncate',
} );
