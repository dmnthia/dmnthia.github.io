/**
 * Created by parki on 3/12/2016.
 */

var Mod = function (mod_id, skill, prefix, suffix, slots, description, ability, apmod, apmodc, afmod, afmodc) {
    this.Id = mod_id;
    this.Skill = skill;
    this.Prefix = prefix;
    this.Suffix = suffix;
    this.Slots = slots;
    this.Description = description;
    this.Ability = ability;
    this.PercentageMod = apmod;
    this.PercentageModChange = apmodc;
    this.FlatMod = afmod;
    this.FlatModChance = afmodc;
};

var EquipmentSlot = function (slot_name) {
    this.Slot = slot_name;
    this.MaxMods = 6;
    this.Mods = Array(this.MaxMods);
};

EquipmentSlot.prototype.setModSlot = function(mod, slot) {
    if (this.Mods.length <= this.MaxMods)
    {
        if
            (mod) this.Mods[slot] = mod;
        else
            this.Mods[slot] = undefined;
        return true;
    }
    return false;
};

EquipmentSlot.prototype.removeModFromSlot = function(slot) {
    old_mod = this.Mods[slot];
    if (old_mod) {
        this.Mods[slot] = undefined;
        return true;
    }
    return false;
};

EquipmentSlot.prototype.removeModsOfSkill = function(skill) {
    for (var i = 0; i < this.Mods.length; i++)
    {
        if (this.Mods[i] && this.Mods[i].Skill == skill) {
            this.removeModFromSlot(i);
        }
    }
};


EquipmentSlot.prototype.getIdForModNumber = function(slot_number) {
    return "#" + this.Slot + "-" + slot_number;
};

var Build = function () {
    this.Head = new EquipmentSlot("Head");
    this.Chest = new EquipmentSlot("Chest");
    this.Necklace = new EquipmentSlot("Necklace");
    this.Hands = new EquipmentSlot("Hands");
    this.Ring = new EquipmentSlot("Ring");
    this.MainHand = new EquipmentSlot("MainHand");
    this.OffHand = new EquipmentSlot("OffHand");
    this.Legs = new EquipmentSlot("Legs");
    this.Feet = new EquipmentSlot("Feet");

    this.Slots = [
        this.Head,
        this.Chest,
        this.Necklace,
        this.Hands,
        this.Ring,
        this.MainHand,
        this.OffHand,
        this.Legs,
        this.Feet];
};


var GorgonBuildSimulator = function () {};

GorgonBuildSimulator.prototype.Initialize = function (mod_source) {
    console.log("Gorgon start");
    this.clearSkills();
    this.clearBuild();
    this.parseMods(mod_source);
    this.drawSkills();
    // Draw the basic mods
    this.drawMods();
    console.log("INITIAL HASH IS " + location.hash)
    if (window.location.hash.length > 1) {
        this.load(window.location.hash);
    } else {
        this.setFirstSkill("Sword");
        this.setSecondSkill("Unarmed");
    }
};

GorgonBuildSimulator.prototype.drawSkills = function() {
    var that = this;
    $.each(Array.prototype.slice.call(Object.keys(this.ValidSkills)).sort(), function(index, skill) {
        if (that.ValidSkills[skill] == false) return;
        $("#firstskill")
            .append($("<option></option>")
                .attr("value", skill)
                .text(skill));
        $("#secondskill")
            .append($("<option></option>")
                .attr("value", skill)
                .text(skill));

    })
};


GorgonBuildSimulator.prototype.clearBuild = function() {
    this.Build = new Build();
};

GorgonBuildSimulator.prototype.clearSkills = function() {
    // Everyone can use AnySkill, Endurance, ArmorPatching and (for now) Unknown mods.
    this.ValidSkills = {};
    this.ValidSkills.AnySkill = false;
    this.ValidSkills.Endurance = false;
    this.ValidSkills.ArmorPatching = false;
    this.ValidSkills.Unknown = false;
};

GorgonBuildSimulator.prototype.clearMods = function() {
    console.log("Clearing all mods");
    this.mods = [];
    this.mods_by_id = {};
};

GorgonBuildSimulator.prototype.addMod = function(mod) {
    this.mods.push(mod);
    this.mods_by_id[mod.Id] = mod;
};

GorgonBuildSimulator.prototype.getModById = function(mod_id) {
    return this.mods_by_id[mod_id];
};

GorgonBuildSimulator.prototype.parseMods = function(mod_source) {
    this.clearSkills();
    this.clearMods();

    console.log("Parsing mods...");
    for (var i = 0; i < mod_source.length; i++) {
        var mod_data = mod_source[i];
        var mod_id = mod_data[0],
            skill = mod_data[1],
            prefix = mod_data[2],
            suffix = mod_data[3],
            slots = mod_data[4],
            description = mod_data[5],
            ability = mod_data[6],
            apmod = mod_data[7],
            apmodc = mod_data[8],
            afmod = mod_data[9],
            afmodc = mod_data[10];
        if (! Object.prototype.hasOwnProperty.call(this.ValidSkills, skill))
            this.ValidSkills[skill] = true;
        var new_mod = new Mod(mod_id, skill, prefix, suffix, slots, description, ability, apmod, apmodc, afmod, afmodc);
        this.addMod(new_mod);
   }
    console.log("Added " + this.mods.length + " mods");
};

GorgonBuildSimulator.prototype.findModsForSkillSlot = function (skill, slot) {
    var res = [];
    for (var i = 0; i  < this.mods.length; i++)
    {
        if (skill == this.mods[i].Skill && $.inArray(slot, this.mods[i].Slots) != -1)
        {
            res.push(this.mods[i]);
        }
    }
    //console.log("Found " + res.length + " mods for (" + skill + ", " + slot + ")");
    return res;
};

GorgonBuildSimulator.prototype.setFirstSkill = function(name) {
    if (this.ValidSkills[name]) {
        var old_skill = this.first_skill;
        this.first_skill = name;
        $("#firstskill").val(name);
        this.drawFirstSkillMods(old_skill);
        return true;
    }
    return false;
};

GorgonBuildSimulator.prototype.setSecondSkill = function(name) {
    if (this.ValidSkills[name]) {
        var old_skill = this.second_skill;
        this.second_skill = name;
        $("#secondskill").val(name);
        this.drawSecondSkillMods(old_skill);
        return true;
    }
    return false;
};

GorgonBuildSimulator.prototype.drawFirstSkillMods = function(old_skill) {
    return this.drawXthSkillMods(this.first_skill, old_skill)
};

GorgonBuildSimulator.prototype.drawSecondSkillMods = function(old_skill) {
    return this.drawXthSkillMods(this.second_skill, old_skill)
};

GorgonBuildSimulator.prototype.drawXthSkillMods = function(new_skill, old_skill) {
    var that = this;
    var that_old_skill = old_skill;
    var that_new_skill = new_skill;

    if (! new_skill) return;
    console.log("Redrawing " + new_skill + " mods...");
    $.each(this.Build.Slots, function(index, slot) {
        for (var modnum = 1; modnum <= slot.MaxMods; modnum++ ) {
            var id = slot.getIdForModNumber(modnum);

            // Clear all options with mods of the old skill.
            $(id).find("option."+that_old_skill).remove();

            // Add the rest
            $.each(that.findModsForSkillSlot(that_new_skill, slot.Slot), function(index, mod) {
                $(id)
                    .append($("<option></option>")
                        .attr("value", mod.Id)
                        .attr("class", that_new_skill)
                        .text("["+mod.Skill+"] : "+mod.Description));
            });
        }
    });

    // Now remove all mods from the current build that use that skill.
    $.each(this.Build.Slots, function(index, slot) {
        slot.removeModsOfSkill(old_skill);
        that.redrawEquipmentSlot(slot.Slot);
    });
};

GorgonBuildSimulator.prototype.drawMods = function() {
    var that = this;

    console.log("Redrawing mods...");
    $.each(this.Build.Slots, function(index, slot) {
        for (var modnum = 1; modnum <= slot.MaxMods; modnum++ ) {
            var id = slot.getIdForModNumber(modnum);
            $(id).empty();
            // Add the blank special mod
            $(id).append($("<option></option>").attr("value", "").text("-"));

            // Add all the mods that are available to everybody
            $.each(Array.prototype.slice.call(Object.keys(that.ValidSkills)).sort(), function(_, skill) {
                if (! that.ValidSkills[skill]) {
                    $.each(that.findModsForSkillSlot(skill, slot.Slot), function(__, mod) {
                        $(id)
                            .append($("<option></option>")
                                .attr("value", mod.Id)
                                .attr("class", skill)
                                .text("["+mod.Skill+"] : "+mod.Description));
                    })
                }
            });
        }
    });
    this.drawFirstSkillMods();
    this.drawSecondSkillMods();
};

GorgonBuildSimulator.prototype.onSetFirstSkill = function(el) {
    var skill = el.val();
    this.setFirstSkill(skill);
};

GorgonBuildSimulator.prototype.onSetSecondSkill = function(el) {
    console.log("onSetSecondSkill");
    var skill = el.val();
    this.setSecondSkill(skill);
};

GorgonBuildSimulator.prototype.onSetSlotMod = function(slot_name, slot_num, el) {
    var mod_id = el.val();
    // Ignore the blank mod selection.
    if (mod_id && mod_id != "") {
        var mod = this.getModById(mod_id);
        if (mod) this.Build[slot_name].setModSlot(mod, slot_num- 1);
    } else {
        this.Build[slot_name].removeModFromSlot(slot_num - 1);
    }
    this.redrawEquipmentSlot(slot_name);
    return false;
};

GorgonBuildSimulator.prototype.getQualityForNumMods = function(num) {
    if (num <= 1) {
        return "normal";
    } else if (num == 2) {
        return "uncommon";
    } else if (num == 3) {
        return "rare";
    } else if (num == 4) {
        return "less-epic";
    } else if (num == 5) {
        return "epic";
    } else if (num == 6) {
        return "legendary";
    }
    return "error";
}
GorgonBuildSimulator.prototype.redrawEquipmentSlot = function(slot_name) {
    var that_slot_name = slot_name;
    var num_mods = 0;
    var new_text = [];
    $("#"+slot_name).text('');

    $("."+slot_name+" .title").attr("class")
    $.each(this.Build[slot_name].Mods, function (index, mod) {
        if (mod) {
            new_text.push(mod.Description);
            num_mods++;
        }
    });
    $("#"+slot_name).html(new_text.join("<br/>"));

    // Lastly, set the minimum item quality needed.
    var quality = this.getQualityForNumMods(num_mods);
    $("."+slot_name+" .title").attr("class", "title "+quality);
    window.replaceHash(this.save());
};

GorgonBuildSimulator.prototype.load = function(serialized) {
    console.log("Hash is "+serialized);
    var that = this;

    var serialized_slots = serialized.substr(1, serialized.length-1).split("|");
    var skills = serialized_slots[0].split("+");

    // Set the skills
    this.setFirstSkill(skills[0]);
    this.setSecondSkill(skills[1]);

    // Now set their mods
    if (serialized_slots) {
        $.each(serialized_slots.splice(1, serialized_slots.length), function(index, slot_data) {
            data = slot_data.split(":")
            slot = data[0];
            console.log("Loading slot "+slot);
            console.log(data);
            $.each(data.splice(1, data.length), function(index, modid) {
                if (modid) {
                    var mod = that.getModById(parseInt(modid));
                    if (mod) {
                        console.log("Setting slot "+(index-1)+" mod "+modid)
                        that.Build[slot].setModSlot(mod, index);
                        var id = "#"+slot+"-"+(index+1);
                        $(id).val(parseInt(modid));
                        that.redrawEquipmentSlot(slot);
                    } else {
                        console.log("Unable to find mod with id "+modid);
                    }
                }
            });
        })
    }
};

GorgonBuildSimulator.prototype.save = function() {
    console.log("Saving")
    var serialized_slots = [];
    $.each(this.Build.Slots, function(_, slot) {
        var serialized_mods = [];
        $.each(slot.Mods, function(index, mod) {
            if (slot.Mods[index]) serialized_mods.push(mod.Id);
        });
        serialized_slots.push(slot.Slot+":"+serialized_mods.join(":"));
    });
    return [this.first_skill, this.second_skill].join("+")+ "|" + serialized_slots.join("|");
};

// Should be executed BEFORE any hash change has occurred.
(function(namespace) { // Closure to protect local variable "var hash"
    if ('replaceState' in history) { // Yay, supported!
        namespace.replaceHash = function(newhash) {
            if ((''+newhash).charAt(0) !== '#') newhash = '#' + newhash;
            history.replaceState('', '', newhash);
        }
    } else {
        var hash = location.hash;
        namespace.replaceHash = function(newhash) {
            if (location.hash !== hash) history.back();
            location.hash = newhash;
        };
    }
})(window);