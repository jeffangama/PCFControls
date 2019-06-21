import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class SiretValidator implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	// Value of the field is stored and used inside the control 
	private _value: string;
	private _isValid: boolean;
	private _iconValid: string;
	private _iconInvalid : string;
	// PCF framework delegate which will be assigned to this object which would be called whenever any update happens. 

	// parameter declarations
	private _valueElement: HTMLInputElement;
	private _valueValidationElement: HTMLElement;
	// Reference to the control container HTMLDivElement
	// This element contains all elements of our custom control example
	private _context: ComponentFramework.Context<IInputs>;
	private _notifyOutputChanged: () => void;
	private _valueChanged: EventListenerOrEventListenerObject;
	/**
	 * Empty constructor.
	 */
	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='starndard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement)
	{
		this._context = context; 
		this._notifyOutputChanged = notifyOutputChanged; 
		
		// Add control initialization code
		this._valueChanged = this.valueChanged.bind(this);
		
		// textbox control
		this._valueElement = document.createElement("input");
		this._valueElement.setAttribute("type", "text");
		this._valueElement.setAttribute("class", "pcfinputcontrol");
		this._valueElement.addEventListener("change", this._valueChanged);
		
		// img control
		this._valueValidationElement = document.createElement("img");
		this._valueValidationElement.setAttribute("class", "pcfimagecontrol");
		this._valueValidationElement.setAttribute("hidden", "hidden");
		this._valueValidationElement.setAttribute("height", "24px");
		
		container.appendChild(this._valueElement);
		container.appendChild(this._valueValidationElement);
	}


	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		this._iconValid = this._context.parameters.IconValid == undefined ? "" : String(this._context.parameters.IconValid.raw);
		this._iconInvalid = this._context.parameters.IconInvalid == undefined ? "" : String(this._context.parameters.IconInvalid.raw);
	}

	/** 
	 * It is called by the framework prior to a control receiving new data. 
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			SiretValue: this._value,
			IsValid : this._isValid
		};	 
	}

	/** 
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		this._valueElement.removeEventListener("change", this._valueChanged);
	}

	private valueChanged(evt: Event):void
	{
		this._value = this._valueElement.value;
		this._value = this._valueElement.value.toUpperCase().replace(/[^0-9]/g, '');
		this._valueElement.value = this._value;
		
		var isValid = false;
		if ( (this._value.length != 14) || (isNaN(parseInt(this._value))) ){
			isValid = false;
		}
		else {
			// Donc le SIRET est un numérique à 14 chiffres
			// Les 9 premiers chiffres sont ceux du SIREN (ou RCS), les 4 suivants
			// correspondent au numéro d'établissement
			// et enfin le dernier chiffre est une clef de LUHN. 
			var sum = 0;
			var tmp: number;
			for (var cpt = 0; cpt < this._value.length; cpt++) {
				if ((cpt % 2) == 0) { // Les positions impaires : 1er, 3è, 5è, etc... 
					tmp = parseInt(this._value.charAt(cpt)) * 2; // On le multiplie par 2

					if (tmp > 9) {
						tmp -= 9;	// Si le résultat est supérieur à 9, on lui soustrait 9
					}
				}
				else {
					tmp = parseInt(this._value.charAt(cpt));
				}
				sum += tmp;
			}

			if ((sum % 10) == 0){
				isValid = true; // Si la somme est un multiple de 10 alors le SIRET est valide 
			}
			else {
				isValid = false;
			}
		}
		
		this._isValid = isValid;
		this._valueValidationElement.removeAttribute("hidden");
		this._valueValidationElement.setAttribute("src", this._isValid ? this._iconValid : this._iconInvalid);

		this._notifyOutputChanged(); 
	}
}