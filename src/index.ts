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
  IFCPROJECT,
  IFCUNITASSIGNMENT,
  IFCGEOMETRICREPRESENTATIONCONTEXT,
  IFCDIMENSIONCOUNT,
  IFCSIUNIT,
  IFCSITE,
  IFCOWNERHISTORY,
  IFCPERSONANDORGANIZATION,
  IFCPERSON,
  IFCORGANIZATION,
  IFCAPPLICATION,
  IFCIDENTIFIER,
  IFCTEXT,
  IFCTIMESTAMP,
  IFCLOCALPLACEMENT,
  IFCBUILDING,
} from "web-ifc/web-ifc-api.js";
import { v4 as uuid } from "uuid";

interface Floor {
  id: string;
  name: string;
  height: number;
}

interface Building {
  id: string;
  name: string;
  floors: Floor[];
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

    const owningApplication = ifcAPI.CreateIfcEntity(
      model,
      IFCAPPLICATION,
      ifcAPI.CreateIfcEntity(
        model,
        IFCORGANIZATION,
        ifcAPI.CreateIfcType(model, IFCIDENTIFIER, "Glodon.Inc"),
        ifcAPI.CreateIfcType(model, IFCLABEL, "Glodon"),
        ifcAPI.CreateIfcType(model, IFCTEXT, "Glodon JSF"),
        null,
        null
      )
    );

    const zUpDirection = ifcAPI.CreateIfcEntity(model, IFCDIRECTION, [
      ifcAPI.CreateIfcType(model, IFCREAL, 0),
      ifcAPI.CreateIfcType(model, IFCREAL, 0),
      ifcAPI.CreateIfcType(model, IFCREAL, 1),
    ]);

    const person = ifcAPI.CreateIfcEntity(
      model,
      IFCPERSON,
      null,
      ifcAPI.CreateIfcType(model, IFCLABEL, "Undefined"),
      null,
      null,
      null,
      null,
      null,
      null
    );

    const organization = ifcAPI.CreateIfcEntity(
      model,
      IFCORGANIZATION,
      null,
      ifcAPI.CreateIfcType(model, IFCLABEL, "Glodon"),
      null,
      null,
      null
    );

    const personAndOrganization = ifcAPI.CreateIfcEntity(
      model,
      IFCPERSONANDORGANIZATION,
      person,
      organization,
      null
    );

    const ownerHistory = ifcAPI.CreateIfcEntity(
      model,
      IFCOWNERHISTORY,
      personAndOrganization,
      owningApplication,
      null,
      IFC4.IfcChangeActionEnum.NOCHANGE,
      null,
      null,
      null,
      ifcAPI.CreateIfcType(model, IFCTIMESTAMP, Math.round(Date.now() / 1000))
    );

    const axis = ifcAPI.CreateIfcEntity(
      model,
      IFCAXIS2PLACEMENT3D,
      createCartesianPoint(model, { x: 0, y: 0, z: 0 }),
      ifcAPI.CreateIfcEntity(model, IFCDIRECTION, [
        ifcAPI.CreateIfcType(model, IFCREAL, 0),
        ifcAPI.CreateIfcType(model, IFCREAL, 0),
        ifcAPI.CreateIfcType(model, IFCREAL, 1),
      ]),
      ifcAPI.CreateIfcEntity(model, IFCDIRECTION, [
        ifcAPI.CreateIfcType(model, IFCREAL, 1),
        ifcAPI.CreateIfcType(model, IFCREAL, 0),
        ifcAPI.CreateIfcType(model, IFCREAL, 0),
      ])
    );

    const project = ifcAPI.CreateIfcEntity(
      model,
      IFCPROJECT,
      ifcAPI.CreateIfcType(
        model,
        IFCGLOBALLYUNIQUEID,
        "3e222ea2-6182-4577-a7eb-99245ef44066"
      ),
      ownerHistory,
      null,
      null,
      null,
      null,
      null,
      [
        ifcAPI.CreateIfcEntity(
          model,
          IFCGEOMETRICREPRESENTATIONCONTEXT,
          null,
          ifcAPI.CreateIfcType(model, IFCLABEL, "Model"),
          ifcAPI.CreateIfcType(model, IFCDIMENSIONCOUNT, 3),
          ifcAPI.CreateIfcType(model, IFCREAL, 0.00001),
          axis,
          ifcAPI.CreateIfcEntity(model, IFCDIRECTION, [
            ifcAPI.CreateIfcType(model, IFCREAL, 0),
            ifcAPI.CreateIfcType(model, IFCREAL, 1),
          ])
        ),
      ],
      ifcAPI.CreateIfcEntity(model, IFCUNITASSIGNMENT, [
        ifcAPI.CreateIfcEntity(
          model,
          IFCSIUNIT,
          IFC4.IfcUnitEnum.LENGTHUNIT,
          null,
          IFC4.IfcSIUnitName.METRE
        ),
        ifcAPI.CreateIfcEntity(
          model,
          IFCSIUNIT,
          IFC4.IfcUnitEnum.AREAUNIT,
          null,
          IFC4.IfcSIUnitName.SQUARE_METRE
        ),
        ifcAPI.CreateIfcEntity(
          model,
          IFCSIUNIT,
          IFC4.IfcUnitEnum.PLANEANGLEUNIT,
          null,
          IFC4.IfcSIUnitName.RADIAN
        ),
      ])
    );
    ifcAPI.WriteLine(model, project);

    const sitePlacement = ifcAPI.CreateIfcEntity(
      model,
      IFCLOCALPLACEMENT,
      null,
      axis
    );

    const site = ifcAPI.CreateIfcEntity(
      model,
      IFCSITE,
      ifcAPI.CreateIfcType(
        model,
        IFCGLOBALLYUNIQUEID,
        "dd30e384-4df5-4653-868d-67e90958acbc"
      ),
      ownerHistory,
      ifcAPI.CreateIfcType(model, IFCLABEL, "Site"),
      null,
      null,
      sitePlacement,
      null,
      null,
      IFC4.IfcElementCompositionEnum.ELEMENT,
      null,
      null,
      null,
      null,
      null
    );

    ifcAPI.WriteLine(model, site);

    // 遍历每栋楼
    buildings.forEach((building, index) => {
      const buildingPlacement = ifcAPI.CreateIfcEntity(
        model,
        IFCLOCALPLACEMENT,
        sitePlacement,
        axis
      );
      const buildingEntity = ifcAPI.CreateIfcEntity(
        model,
        IFCBUILDING,
        ifcAPI.CreateIfcType(model, IFCGLOBALLYUNIQUEID, building.id),
        ownerHistory,
        ifcAPI.CreateIfcType(model, IFCLABEL, building.name),
        null,
        null,
        buildingPlacement,
        null,
        null,
        IFC4.IfcElementCompositionEnum.ELEMENT,
        null,
        null,
        null
      );
      ifcAPI.WriteLine(model, buildingEntity);
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
      building.floors.reduce((elevation, floor) => {
        // 楼层的位置
        const location = createCartesianPoint(model, {
          x: 0,
          y: 0,
          z: elevation,
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
          ifcAPI.CreateIfcType(model, IFCPOSITIVELENGTHMEASURE, floor.height)
        );
        // 楼层实体
        const buildingStorey = ifcAPI.CreateIfcEntity(
          model,
          IFCBUILDINGSTOREY,
          ifcAPI.CreateIfcType(model, IFCGLOBALLYUNIQUEID, uuid()),
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
        ifcAPI.WriteLine(model, buildingStorey);
        return elevation + floor.height;
      }, 0);
    });
    return model;
  }
  // 定义建筑数据
  const buildings: Building[] = [
    {
      id: "d2d16430-c182-4f30-800e-5450e5097023",
      name: "Building 1",
      floors: new Array(6).fill(0).map((_, index) => ({
        id: uuid(),
        name: `Floor ${index + 1}`,
        height: 3,
      })),
      outline: [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 0, z: 0 },
        { x: 10, y: 10, z: 0 },
        { x: 0, y: 10, z: 0 },
      ],
    },
    {
      id: "e06f3956-73c3-4455-ad2d-f65cd22470f8",
      name: "Building 2",
      floors: new Array(20).fill(0).map((_, index) => ({
        id: uuid(),
        name: `Floor ${index + 1}`,
        height: 3,
      })),
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
