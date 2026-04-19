#!/usr/bin/env python3
"""
Script to assign employees to departments
Run from backend directory: python ../assign_departments.py
"""

import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from factory import create_app
from extensions import db
from models.user import User
from models.department import Department

def assign_employees_to_departments():
    """Assign all employees to departments"""
    
    app = create_app()
    with app.app_context():
        # Check departments
        departments = Department.query.all()
        print("\n📋 DEPARTMENTS IN DATABASE:")
        for d in departments:
            print(f"  ID: {d.id}, Name: {d.name}, Code: {d.code}")
        
        print("\n👥 CURRENT USER ASSIGNMENTS:")
        users = User.query.all()
        for u in users:
            dept_name = "UNASSIGNED"
            if u.department_id:
                dept = Department.query.get(u.department_id)
                dept_name = dept.name if dept else "INVALID_DEPT"
            role_name = u.role.name if u.role else 'None'
            print(f"  {u.username:<20} (Role: {role_name:<10}) → Dept: {dept_name}")
        
        print("\n🔧 ASSIGNING EMPLOYEES TO DEPARTMENTS...\n")
        
        # Get departments
        it_dept = Department.query.filter_by(code='IT').first()
        hr_dept = Department.query.filter_by(code='HR').first()
        ops_dept = Department.query.filter_by(code='OPS').first()
        fin_dept = Department.query.filter_by(code='FIN').first()
        
        # Get all employees (role_id 4 = Employee)
        employees = User.query.filter_by(role_id=4).all()
        
        # Also get managers to verify they exist
        managers = User.query.filter(User.role_id.in_([2, 3])).all()
        
        print(f"Found {len(employees)} employees and {len(managers)} managers\n")
        
        # Assign employees in batches
        assignments = [
            (employees[0] if len(employees) > 0 else None, it_dept, "IT Team"),
            (employees[1] if len(employees) > 1 else None, it_dept, "IT Team"),
            (employees[2] if len(employees) > 2 else None, hr_dept, "HR Team"),
            (employees[3] if len(employees) > 3 else None, hr_dept, "HR Team"),
            (employees[4] if len(employees) > 4 else None, ops_dept, "Operations Team"),
        ]
        
        for emp, dept, team_name in assignments:
            if emp and dept:
                emp.department_id = dept.id
                print(f"  ✓ Assigned {emp.username:<20} → {dept.name} ({team_name})")
            elif emp:
                print(f"  ⚠ {emp.username:<20} → Department not found")
        
        # Commit all changes
        db.session.commit()
        print("\n✅ Changes committed to database!\n")
        
        # Verification
        print("✅ VERIFICATION - Final State:\n")
        users = User.query.all()
        for u in users:
            if u.department_id:
                dept = Department.query.get(u.department_id)
                dept_name = dept.name if dept else "INVALID"
                status = "✓"
            else:
                dept_name = "UNASSIGNED"
                status = "✗"
            
            role_name = u.role.name if u.role else 'None'
            print(f"  {status} {u.username:<20} | Role: {role_name:<10} | Dept: {dept_name}")
        
        print("\n" + "="*70)
        print("✨ Department assignment complete!")
        print("="*70)

if __name__ == '__main__':
    try:
        assign_employees_to_departments()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)