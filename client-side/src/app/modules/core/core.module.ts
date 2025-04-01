import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OverlaySpinnerComponent} from "./components/overlay-spinner/overlay-spinner.component";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OverlaySpinnerComponent
  ],exports: [OverlaySpinnerComponent]
})
export class CoreModule { }
