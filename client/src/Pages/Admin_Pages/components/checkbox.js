import React from 'react';

/**
 * Component used for classes and uses checkboxes
 */
export const CheckBox = (props) => {
    return (
        <div>
            <input
                key={props.id}
                onChange={props.handleCheckChieldElement}
                type="checkbox"
                checked={props.isChecked}
                value={props.value}
            />
            &nbsp;&nbsp;
            {props.value}
        </div>
    );
};

export default CheckBox;
