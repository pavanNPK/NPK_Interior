import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import {NbToastrModule, NbTooltipModule} from "@nebular/theme";
import {NbEvaIconsModule} from "@nebular/eva-icons";
import {HTTP_INTERCEPTORS} from "@angular/common/http";
import {OverlaySpinnerService} from "../../services/overlay-spinner.service";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NbEvaIconsModule,
    NbTooltipModule,
    NbToastrModule.forRoot()
  ],
})
export class HomeModule { }
