import React, {createRef} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../style/index.css";
import {ToggleButton, ButtonGroup} from "react-bootstrap"
import { MdTextFields } from 'react-icons/md';
import Math from "./Math"
import { CSSProperties } from '@material-ui/core/styles/withStyles';

type MyProps = {
    // using `interface` is also ok
    value: string;
    onChange: (text: string) => void;
    readOnly: boolean;
    automateScroll: boolean;
};

type MyState = {
    val: string,
    radioValue: string; // like this
};

//https://www.typescriptlang.org/docs/handbook/jsx.html
//https://github.com/microsoft/TypeScript/issues/15449
//Needed since math-field is a custom html element
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'math-field': any;
        }
    }
}

let MAX_WIDTH = 1100;

class MathField extends React.Component<MyProps, MyState> {
    private myRef = createRef<HTMLElement>(); //reference for the math field
    private textMode: boolean;

    constructor(props: MyProps) {
        super(props);

        this.textMode = false; //if text mode is set
        this.setRadioValue = this.setRadioValue.bind(this) //for switching between modes
        this.flipMode = this.flipMode.bind(this) //method for flipping the mode

        this.state = {
          val: "text",
          radioValue: "text"
        }
    }

    //updates the button for which mode it is
    setRadioValue(val: string) {
        //https://medium.com/@martin_hotell/react-refs-with-typescript-a32d56c4d315 - For react typescript refs
        //https://github.com/microsoft/TypeScript/issues/10453 fixing type assertions
        const node = this.myRef.current! as any; //not the best way to do this, but can be done when we know this.myRef exists
        node.mode = val; //update the field
        this.textMode = val === "text"; //update text mode
        //https://stackoverflow.com/questions/45557301/how-to-change-the-state-with-react-typescript-2-0
        this.setState({
            radioValue: val, 
            val: this.state.val
        }); 

        let virtualKeyboards = "";

        if(val === "text") {
          virtualKeyboards = 'roman'
        } else {
          virtualKeyboards = 'numeric symbols roman functions greek'
        }

        let virtualKeyboardMode = "auto";

        if(window.innerWidth > MAX_WIDTH) {
          virtualKeyboardMode = "manual";
        }

        //https://cortexjs.io/mathlive/guides/virtual-keyboards/
        //On touch enabled devices, the virtual keyboard is shown
        node.setOptions({
          virtualKeyboardMode: virtualKeyboardMode,
          readOnly: this.props.readOnly,
          virtualKeyboards: virtualKeyboards
        });
    }
  
    //flips the mode
    flipMode() {
        this.textMode = !this.textMode;
        let mode: string = this.textMode ? "text" : "math";
        const node = this.myRef.current! as any; //not the best way to do this, but can be done when we know this.myRef exists
        node.mode = mode;
    }


    componentDidMount() {

        //We first insert the answer when it is in math mode because text with " " (quotation marks) is still shown as text in math mode.
        //Then, we switch to text mode.
  
        var currentVal = this.props.value;

        const node = this.myRef.current! as any;

        let isTextMode;

        if(currentVal.indexOf('"') !== 0 && currentVal.length > 0) {
          //math OR text from an old game
  
          //counted as text if more than half the characters are letters
          let potentialText = (text: string) => {
  
            let lowerCaseText = text.toLowerCase(); //makes text lowercase
            let letterCount = 0;
  
            for(let i = 0; i < lowerCaseText.length; i++) {
              let charCode = lowerCaseText.charCodeAt(i); //get lowercase character
              if(charCode >= 97 && charCode <= 122 ) { //a,b,c...z
                letterCount += 1;
              }
  
            }
            return letterCount >= text.length / 2;
          }


  
          if(potentialText(currentVal)) {
            //need to switch to text mode before adding to math field
            this.setRadioValue("text");
            node.insert(currentVal);
            this.props.onChange('"' + currentVal + '"');
            isTextMode = true;
          } else {
            //regular math
            node.insert(currentVal);
            this.setRadioValue("math");
            isTextMode = false;
          }
        } else {
          //text
          node.insert(currentVal);
          this.setRadioValue("text");
          isTextMode = true;
        }
        
        //event listener for the 
        node.addEventListener('input',(ev: any) => {
          // `ev.target` is an instance of `MathfieldElement`
          ev.preventDefault();


          let val = ev.target.getValue('ascii-math')
  
          this.props.onChange(val);
  
          var change = () => {
            this.flipMode();
            setTimeout(this.flipMode, 500);
          }
  
          //flip to other then flip back - this is a temporary solution for when the math field resets when it is empty.
          if(val === "") {
            change();
          }
      
          
        });

        //Scrolls page down on mobile devices so mathlive input is shown above the virtual keyboard
        //https://cortexjs.io/mathlive/guides/interacting/ - info on what event for detecting when a user has started editing
        node.addEventListener('focus', (ev: any) => {

          if(window.innerWidth <= MAX_WIDTH && this.props.automateScroll) {

            let scrollDown = () => {
              document.querySelector('.submitModal')!.scrollBy(0, window.innerHeight);
            }
            setTimeout(scrollDown, 500);
          }

        });
        
  
        //To prevent scroll when clicking the space bar
        node.addEventListener('keydown', function(e: any) {
          //Deprecated: On macs, this prevents space characters. Before, it prevented the page from scrolling
          //after pressing space bar on Windows.
          // if(e.keyCode === 32) {
          //   e.preventDefault();
          // }
        });  
  
      }
  
      componentWillUnmount() {
        const node = this.myRef.current! as any;

        node.removeEventListener('input');
        node.removeEventListener('keydown');
        node.removeEventListener('click');
      } 
  
      render() {
  
        let divStyle: CSSProperties = {
          width: '100%',
          margin: "0 auto",
          textAlign: "center",
          display: "flex",
          justifyContent: "center"
        }
  
        //small UI - make the text color of the icon go with the background, which is either aqua or white
        let textIconColor = this.textMode ? "white" : "black";
  
          return(
  
            <div style = {divStyle}>
                <math-field ref={this.myRef} name = "mathfield" id="formula" default-mode = "math" />
  
                  <ButtonGroup vertical={true} toggle>
                          <ToggleButton className = "btn-aqua"
                      key={1}
                      type="radio"
                      variant="aqua"
                      name="radio"
                      value={"text"}
                      checked = {this.state.radioValue === "text"}
                      onChange={(e) => this.setRadioValue(e.currentTarget.value)}
                    >
                      <MdTextFields color = {textIconColor} size = "20px" />
                    </ToggleButton>
                    <ToggleButton
                    key={2}
                    type="radio"
  
                      variant="aqua"
                      name="radio"
                      value={"math"}
                      checked = {this.state.radioValue === "math"}
                      onChange={(e) => this.setRadioValue(e.currentTarget.value)}
                    >
                      <div style = {{fontSize: "10px"}}>
                        <Math  text = "{sqrt(pi)}"></Math>
                      </div>
  
                    </ToggleButton>
                </ButtonGroup >
            </div>
  
  
          ) ;
      }


}

export default MathField;
