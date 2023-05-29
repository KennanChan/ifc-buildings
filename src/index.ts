import {
  IfcAPI,
  IFC4,
  IFCEXTRUDEDAREASOLID,
  Schemas,
  IFCARBITRARYCLOSEDPROFILEDEF,
  IFCPOLYLINE,
  IFCCARTESIANPOINT,
  IFCLENGTHMEASURE,
  IFCAXIS2PLACEMENT3D,
  IFCDIRECTION,
  IFCREAL,
  IFCLABEL,
  IFCPOSITIVELENGTHMEASURE,
  IFCBUILDINGSTOREY,
  IFCGLOBALLYUNIQUEID,
} from "web-ifc/web-ifc-api.js";

interface Building {
  floorCount: number;
  floorHeight: number;
  outline: Point[];
}

interface Point {
  x: number;
  y: number;
  z: number;
}

const ifcAPI = new IfcAPI();
ifcAPI.Init().then(() => {
  function createCartesianPoint(model: number, point: Point) {
    return ifcAPI.CreateIfcEntity(model, IFCCARTESIANPOINT, [
      ifcAPI.CreateIfcType(model, IFCLENGTHMEASURE, point.x),
      ifcAPI.CreateIfcType(model, IFCLENGTHMEASURE, point.y),
      ifcAPI.CreateIfcType(model, IFCLENGTHMEASURE, point.z),
    ]);
  }

  function createModel(buildings: Building[]): number {
    const model = ifcAPI.CreateModel({
      schema: Schemas.IFC2X3,
      name: "Model",
    });
    const zUpDirection = ifcAPI.CreateIfcEntity(model, IFCDIRECTION, [
      ifcAPI.CreateIfcType(model, IFCREAL, 0),
      ifcAPI.CreateIfcType(model, IFCREAL, 0),
      ifcAPI.CreateIfcType(model, IFCREAL, 1),
    ]);

    // 遍历每栋楼
    buildings.forEach((building, index) => {
      const profileLabel = ifcAPI.CreateIfcType(
        model,
        IFCLABEL,
        `Building ${index}`
      );
      // 楼栋轮廓
      const polyline = ifcAPI.CreateIfcEntity(
        model,
        IFCPOLYLINE,
        [...building.outline, building.outline[0]].map((point) => {
          return createCartesianPoint(model, point);
        })
      );
      // 楼栋轮廓的实体
      const profile = ifcAPI.CreateIfcEntity(
        model,
        IFCARBITRARYCLOSEDPROFILEDEF,
        IFC4.IfcProfileTypeEnum.AREA,
        profileLabel,
        polyline
      );
      // 创建楼层实体
      for (let floorIndex = 0; floorIndex < building.floorCount; floorIndex++) {
        // 楼层的位置
        const location = createCartesianPoint(model, {
          x: 0,
          y: 0,
          z: floorIndex * building.floorHeight,
        });
        // 楼层的位置实体
        const placement = ifcAPI.CreateIfcEntity(
          model,
          IFCAXIS2PLACEMENT3D,
          location,
          null,
          null
        );
        // 楼层的几何实体
        const extrusion = ifcAPI.CreateIfcEntity(
          model,
          IFCEXTRUDEDAREASOLID,
          profile,
          placement,
          zUpDirection,
          ifcAPI.CreateIfcType(
            model,
            IFCPOSITIVELENGTHMEASURE,
            building.floorHeight
          )
        );
        // 楼层实体
        const floor = ifcAPI.CreateIfcEntity(
          model,
          IFCBUILDINGSTOREY,
          ifcAPI.CreateIfcType(model, IFCGLOBALLYUNIQUEID, "GUID"),
          null,
          ifcAPI.CreateIfcType(model, IFCLABEL, "name"),
          null,
          null,
          null,
          extrusion,
          null,
          IFC4.IfcElementCompositionEnum.ELEMENT,
          null
        );
        // 写入IFC模型
        ifcAPI.WriteLine(model, floor);
      }
    });
    return model;
  }
  // 定义建筑数据
  const buildings = [
    {
      floorCount: 5,
      floorHeight: 3,
      outline: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 10, y: 10, z: 0 },
        { x: 0, y: 10, z: 0 },
      ],
    },
    {
      floorCount: 26,
      floorHeight: 3,
      outline: [
        { x: 50, y: 100, z: 0 },
        { x: 70, y: 100, z: 0 },
        { x: 70, y: 180, z: 0 },
        { x: 50, y: 180, z: 0 },
      ],
    },
    // 添加更多楼栋...
  ];

  const model = createModel(buildings);
  saveUint8ArrayAsFile(ifcAPI.SaveModel(model), "model.ifc");
});

function saveUint8ArrayAsFile(uint8: Uint8Array, filename: string) {
  const blob = new Blob([uint8], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
