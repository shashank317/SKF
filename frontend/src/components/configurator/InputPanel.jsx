import { getParametersByCategory } from '../../constants/parameters';

const InputPanel = ({ values, onChange }) => {
    // Get categorized parameters
    const categories = getParametersByCategory();

    const renderInput = (param) => (
        <div className="form-group" key={param.key}>
            <label>
                {param.label}
                {param.unit && <span className="unit"> ({param.unit})</span>}
            </label>
            <input
                type={param.type === 'number' ? 'number' : 'text'}
                placeholder={`Enter ${param.label}`}
                value={values[param.key] || ''}
                onChange={(e) => onChange(param.key, e.target.value)}
            />
        </div>
    );

    return (
        <section className="input-panel">
            <h2>Configuration</h2>

            <div className="panel-section">
                <h3>Identification</h3>
                {categories.identification.map(renderInput)}
            </div>

            <div className="panel-section">
                <h3>Surface Treatment</h3>
                {categories.treatment.map(renderInput)}
            </div>

            <div className="panel-section">
                <h3>Lubrication</h3>
                <div className="grid-2-col">
                    {categories.lubrication.map(renderInput)}
                </div>
            </div>

            <div className="panel-section">
                <h3>Configuration</h3>
                {categories.configuration.map(renderInput)}
            </div>

            <div className="panel-section">
                <h3>Main Dimensions</h3>
                <div className="grid-2-col">
                    {categories.mainDimensions.map(renderInput)}
                </div>
            </div>

            <div className="panel-section">
                <h3>Additional Dimensions</h3>
                <div className="grid-2-col">
                    {categories.additionalDimensions.map(renderInput)}
                </div>
            </div>

            <div className="panel-section">
                <h3>Alterations</h3>
                <div className="grid-2-col">
                    {categories.alterations.map(renderInput)}
                </div>
            </div>
        </section>
    );
};

export default InputPanel;


