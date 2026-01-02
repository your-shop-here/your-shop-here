const horizontalIcons : any = {
    left: 'fa-align-left',
    center: 'fa-align-center',
    right: 'fa-align-right',
};

const verticalIcons : any = {
    start: 'fa-chevron-up',
    center: 'fa-minus',
    end: 'fa-chevron-down',
};

interface AlignmentSelectorProps {
    name: string;
    value: string;
    direction: 'vertical' | 'horizontal';
    onChange: (a: string) => void;
}

export default function AlignmentSelector({
    name,
    value,
    direction,
    onChange
} : AlignmentSelectorProps) {

    function handleSelection(alignment : string) {
        onChange(alignment === value ? '' : alignment);
    }

    function getSelectionClass(placement : string) {
        return value === placement ? 'slds-button_brand' : 'slds-button_neutral';
    }

    let buttons;
    if (direction === 'vertical') {
        buttons = ['start', 'center', 'end'].map((value, index) => {
            return (
                <button
                    key={index}
                    onClick={() => handleSelection(value)}
                    className={`slds-button ${getSelectionClass(value)}`}
                >
                    <i className={`fas ${verticalIcons[value]} fa-lg`}></i>
                </button>
            );
        });
    } else {
        buttons = ['left', 'center', 'right'].map((value, index) => {
            return (
                <button
                    key={index}
                    onClick={() => handleSelection(value)}
                    className={`slds-button ${getSelectionClass(value)}`}
                >
                    <i className={`fas ${horizontalIcons[value]} fa-lg`}></i>
                </button>
            )
        })
    } 

    return (
        <div className={`slds-form-element`}>
            <label className="slds-form-element__label">{name}</label>
            <div className="slds-form-element__control slds-grid">{buttons}</div>
        </div>
    );
}
