import React from "react";

interface InputSmilesVisProps {}

interface InputSmilesVisState {
    smilesString: string;
}

class InputSmilesVis extends React.Component<InputSmilesVisProps, InputSmilesVisState> {
    constructor(props: InputSmilesVisProps) {
        super(props);
        this.state = { smilesString: "" };
    }

    handleChange = (e: { target: { name: any; value: any } }) => {
        this.setState({ ...this.state, [e.target.name]: e.target.value });
    };

    render() {
        return (
            <div className="InputSmilesVis">
                <input
                    name="smilesString"
                    type="text"
                    placeholder="Write a smiles seq (random attributions)"
                    value={this.state.smilesString}
                    onChange={this.handleChange}
                ></input>
            </div>
        );
    }
}

export default InputSmilesVis;
