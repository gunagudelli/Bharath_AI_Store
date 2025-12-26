import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('<App />', () => {
    it('renders correctly', () => {
        render(<Text>Hello World</Text>);
        expect(screen.getByText('Hello World')).toBeTruthy();
    });
});
