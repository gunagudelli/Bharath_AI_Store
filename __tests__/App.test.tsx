import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

describe('<App />', () => {
    it('has 1 child', () => {
        const tree = render(<Text>Hello World</Text>).toJSON();
        expect(tree.children.length).toBe(1);
    });
});
