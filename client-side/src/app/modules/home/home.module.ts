import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home-routing.module';
import {NbDialogModule, NbToastrModule, NbTooltipModule} from "@nebular/theme";
import {NbEvaIconsModule} from "@nebular/eva-icons";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    NbEvaIconsModule,
    NbTooltipModule,
    NbToastrModule.forRoot(),
    NbDialogModule.forRoot()
  ],
})
export class HomeModule { }
