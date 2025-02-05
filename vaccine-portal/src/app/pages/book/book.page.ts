import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';

export class DateValidator {
  static LessThanToday(control: FormControl): ValidationErrors | null {
       let today : Date = new Date();
      if (new Date(control.value) < today)
          return { "LessThanToday": true };
      return null;
  }
}

@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements ViewWillEnter, OnInit {
  records = []
  @ViewChild(IonModal) modal: IonModal;
  vaccineForm: FormGroup

  constructor(private userService: UserService, private formBuilder: FormBuilder) { }
  ngOnInit(): void {
    this.vaccineForm = this.formBuilder.group({
      name: ["", [Validators.required]],
      date: ["", [Validators.required, DateValidator.LessThanToday]],
      vaccinescount: ["", [Validators.required, Validators.min(0)]]
    });
  }



  ionViewWillEnter() {
    this.getVaccinationSlots()
  }

  async getVaccinationSlots() {
    this.records = []
    this.records = (await this.userService.getRecordList('vaccinedrive', false, '+date,+name', null)).items
    console.log(this.records)
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.vaccineForm.value, 'confirm');
  }

  async onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log(ev.detail.data);
      this.vaccineForm.reset()
      await this.userService.createRecord('vaccinedrive', ev.detail.data, 'created_by')
      this.getVaccinationSlots()

    }
  }

}
