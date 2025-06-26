// demonstrate that "create post" button is disabled when the user is viewing application as a guest
// demonstrate that the "create post" button is enabled when the user is viewing the application as a registered user

import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import Banner from './components/Banner';

describe('Create Post button only works when logged in', () => {
    afterEach(cleanup);

    // making fake props so that banner can run
    const extraProps = {
        onPhredditClick: jest.fn(),
        onSearchBarClick: jest.fn(),
        redPost: false,
        onLogout: jest.fn(),
        onUserSelect: jest.fn(),
        user: {displayName: 'Test User'}
    }

    test('should trigger "Create Post" button', () => {
        let onCreatePostClick = jest.fn();
        render(<Banner isLoggedIn={true} {...extraProps} onCreatePostClick={onCreatePostClick} />)

        const button = screen.getByText(/create post/i);
        // const button = screen.getByRole('button', { name: /create post/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onCreatePostClick).toHaveBeenCalled();
    });

    test('should not trigger "Create Post" button', () => {
        let onCreatePostClick = jest.fn();
        render(<Banner isLoggedIn={false} {...extraProps} onCreatePostClick={onCreatePostClick} />)

        const button = screen.getByText(/create post/i);
        // const button = screen.getByRole('button', { name: /create post/i });
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(onCreatePostClick).not.toHaveBeenCalled();
    });


});