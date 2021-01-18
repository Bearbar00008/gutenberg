/**
 * Internal dependencies
 */
import firstTimeContributorLabel from '../';

describe( 'firstTimeContributorLabel', () => {
	const payload = {
		repository: {
			owner: {
				login: 'WordPress',
			},
			name: 'gutenberg',
		},
		pull_request: {
			user: {
				login: 'ghost',
			},
			number: 123,
		},
	};

	it( 'does nothing if the user has at least one commit', async () => {
		const octokit = {
			repos: {
				listCommits: jest.fn( () =>
					Promise.resolve( {
						data: [
							{ sha: '4c535288a6a2b75ff23ee96c75f7d9877e919241' },
						],
					} )
				),
			},
			issues: {
				addLabels: jest.fn(),
				createComment: jest.fn(),
			},
		};

		await firstTimeContributorLabel( payload, octokit );

		expect( octokit.repos.listCommits ).toHaveBeenCalledWith( {
			owner: 'WordPress',
			repo: 'gutenberg',
			author: 'ghost',
		} );
		expect( octokit.issues.addLabels ).not.toHaveBeenCalled();
		expect( octokit.issues.createComment ).not.toHaveBeenCalled();
	} );

	it( 'adds the First Time Contributor label if the user has no commits', async () => {
		const octokit = {
			repos: {
				listCommits: jest.fn( () =>
					Promise.resolve( {
						data: [],
					} )
				),
			},
			issues: {
				addLabels: jest.fn(),
				createComment: jest.fn(),
			},
		};

		const expectedComment =
			':wave: Thanks for your first Pull Request and for helping build the future of Gutenberg and WordPress, @ghost' +
			"!. In case you missed it, we'd love to have you join us in our [Slack community](https://make.wordpress.org/chat/)," +
			'where we hold [regularly weekly meetings](https://make.wordpress.org/core/tag/core-editor-summary/) open to anyone to coordinate with each other.\n\n' +
			'If you want to learn more about WordPress development in general, check out the [Core Handbook](https://make.wordpress.org/core/handbook/) full of helpful information.';

		await firstTimeContributorLabel( payload, octokit );

		expect( octokit.repos.listCommits ).toHaveBeenCalledWith( {
			owner: 'WordPress',
			repo: 'gutenberg',
			author: 'ghost',
		} );
		expect( octokit.issues.addLabels ).toHaveBeenCalledWith( {
			owner: 'WordPress',
			repo: 'gutenberg',
			issue_number: 123,
			labels: [ 'First-time Contributor' ],
		} );
		expect( octokit.issues.createComment ).toHaveBeenCalledWith( {
			owner: 'WordPress',
			repo: 'gutenberg',
			issue_number: 123,
			body: expectedComment,
		} );
	} );
} );