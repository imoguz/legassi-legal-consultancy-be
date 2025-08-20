module.exports = {
  Employee: {
    type: "object",
    properties: {
      _id: { type: "string", description: "Employee ID" },
      firstName: { type: "string" },
      lastName: { type: "string" },
      dateOfBirth: { type: "string", format: "date" },
      nationalId: {
        type: "string",
        description: "Encrypted national ID",
        readOnly: true,
      },

      emails: {
        type: "array",
        items: {
          type: "object",
          properties: {
            address: { type: "string", format: "email" },
            isPrimary: { type: "boolean" },
          },
        },
      },

      phoneNumbers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              enum: ["mobile", "office", "home", "emergency", "fax", "other"],
            },
            number: { type: "string" },
            isPrimary: { type: "boolean" },
          },
        },
      },

      address: {
        type: "object",
        properties: {
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          postalCode: { type: "string" },
          country: { type: "string" },
        },
      },

      department: {
        type: "string",
        enum: [
          "corporate-law",
          "litigation",
          "ip",
          "family-law",
          "real-estate",
          "tax",
          "finance",
          "hr",
          "it",
          "admin",
          "business-dev",
          "compliance",
        ],
      },

      position: {
        type: "string",
        enum: [
          "juniorLawyer",
          "seniorLawyer",
          "paralegal",
          "accountant",
          "hrManager",
          "itSpecialist",
          "adminStaff",
          "intern",
          "contractor",
          "other",
        ],
      },

      employmentType: {
        type: "string",
        enum: ["full-time", "part-time", "intern", "contract", "consultant"],
      },

      status: {
        type: "string",
        enum: ["active", "on-leave", "terminated", "resigned", "retired"],
      },

      systemRole: {
        type: "string",
        enum: [
          "admin",
          "lawyer",
          "assistant",
          "finance",
          "staff",
          "hr",
          "complianceOfficer",
        ],
      },

      hireDate: { type: "string", format: "date" },
      terminationDate: { type: "string", format: "date" },

      salary: {
        type: "object",
        properties: {
          baseAmount: { type: "number" },
          currency: { type: "string", default: "USD" },
          netAmount: { type: "number" },
          paySchedule: {
            type: "string",
            enum: ["monthly", "weekly", "yearly"],
          },
          bonus: { type: "number" },
          benefits: { type: "array", items: { type: "string" } },
          lastUpdated: { type: "string", format: "date-time" },
        },
      },

      profileImage: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      notes: { type: "string" },

      isDeleted: { type: "boolean" },
      createdBy: { type: "string" },
      updatedBy: { type: "string" },
      deletedBy: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
    example: {
      _id: "6653f43b6a2c45f1a9e2d123",
      firstName: "Jane",
      lastName: "Doe",
      dateOfBirth: "1990-05-12",
      emails: [{ address: "jane@example.com", isPrimary: true }],
      phoneNumbers: [
        { label: "mobile", number: "+90 555 555 55 55", isPrimary: true },
      ],
      department: "hr",
      position: "hrManager",
      employmentType: "full-time",
      status: "active",
      systemRole: "hr",
      hireDate: "2023-02-15",
      salary: {
        baseAmount: 5000,
        currency: "USD",
        paySchedule: "monthly",
        bonus: 500,
        benefits: ["health insurance"],
        lastUpdated: "2025-08-16T14:22:05.000Z",
      },
      profileImage: "https://example.com/image.jpg",
      tags: ["remote", "bilingual"],
      notes: "Strong negotiation skills",
      createdBy: "6653f43b6a2c45f1a9e2d111",
      createdAt: "2025-08-16T14:22:05.000Z",
      updatedAt: "2025-08-19T14:22:05.000Z",
    },
  },

  EmployeeCreateInput: {
    type: "object",
    required: ["firstName", "lastName", "department", "position", "systemRole"],
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      dateOfBirth: { type: "string", format: "date" },
      emails: {
        type: "array",
        items: {
          type: "object",
          properties: {
            address: { type: "string", format: "email" },
            isPrimary: { type: "boolean" },
          },
        },
      },
      phoneNumbers: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            number: { type: "string" },
            isPrimary: { type: "boolean" },
          },
        },
      },
      address: { $ref: "#/components/schemas/Employee/properties/address" },
      department: { type: "string" },
      position: { type: "string" },
      employmentType: { type: "string" },
      status: { type: "string" },
      systemRole: { type: "string" },
      hireDate: { type: "string", format: "date" },
      salary: { $ref: "#/components/schemas/Employee/properties/salary" },
      profileImage: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      notes: { type: "string" },
    },
  },

  EmployeeUpdateInput: {
    type: "object",
    properties: {
      firstName: { type: "string" },
      lastName: { type: "string" },
      dateOfBirth: { type: "string", format: "date" },
      emails: {
        $ref: "#/components/schemas/EmployeeCreateInput/properties/emails",
      },
      phoneNumbers: {
        $ref: "#/components/schemas/EmployeeCreateInput/properties/phoneNumbers",
      },
      address: { $ref: "#/components/schemas/Employee/properties/address" },
      department: { type: "string" },
      position: { type: "string" },
      employmentType: { type: "string" },
      status: { type: "string" },
      systemRole: { type: "string" },
      hireDate: { type: "string", format: "date" },
      terminationDate: { type: "string", format: "date" },
      salary: { $ref: "#/components/schemas/Employee/properties/salary" },
      profileImage: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      notes: { type: "string" },
    },
  },
};
