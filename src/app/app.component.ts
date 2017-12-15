import { FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  personForm: any;
  people = [];

  constructor(private fb: FormBuilder){
    this.personForm = this.fb.group({
      'addPerson': ['', Validators.required],
      'superPower': [false],
      'rich':[false],
      'genius':[false]
    })
  }

  savePerson() {
    let value = this.personForm.value;
    
    if (this.personForm.valid) {
      let person = {
        name: value.addPerson,
        superPower: value.superPower,
        rich: value.rich,
        genius: value.genius
      }

      this.people.push(person);
      console.log(this.personForm.value.addPerson)
      this.personForm.reset();

    }
  }

  removePerson(person){
    let index = this.people.indexOf(person);
    this.people.splice(index, 1);
  }

  onChange(event,person,selector) {
    person[selector] = event.returnValue;
  }
}
