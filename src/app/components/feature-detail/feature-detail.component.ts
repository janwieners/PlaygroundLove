import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-feature-detail',
  templateUrl: './feature-detail.component.html',
  styleUrls: ['./feature-detail.component.scss']
})
export class FeatureDetailComponent implements OnInit {

  constructor(private featureDetailRef: MatBottomSheetRef<FeatureDetailComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public feature: any) {
  }

  ngOnInit(): void {
  }

}
